'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface MoveCardParams {
  cardId: string;
  sourceColumnId: string;
  destinationColumnId: string;
  sourceIndex: number;
  destinationIndex: number;
}

export function useKanban() {
  const queryClient = useQueryClient();

  const { data: columns = [], isLoading: isLoadingColumns } = useQuery({
    queryKey: ['kanban', 'columns'],
    queryFn: async () => {
      const response = await fetch('/api/kanban/columns');
      if (!response.ok) throw new Error('Failed to fetch columns');
      return response.json();
    },
  });

  const { data: cards = [], isLoading: isLoadingCards } = useQuery({
    queryKey: ['kanban', 'cards'],
    queryFn: async () => {
      const response = await fetch('/api/kanban/cards');
      if (!response.ok) throw new Error('Failed to fetch cards');
      return response.json();
    },
  });

  const { mutate: moveCard } = useMutation({
    mutationFn: async (params: MoveCardParams) => {
      const response = await fetch('/api/kanban/move-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error('Failed to move card');
      return response.json();
    },
    onMutate: async (params) => {
      await queryClient.cancelQueries({ queryKey: ['kanban', 'cards'] });

      const previousCards = queryClient.getQueryData(['kanban', 'cards']);

      queryClient.setQueryData(['kanban', 'cards'], (old: any[]) => {
        const newCards = [...old];
        const card = newCards.find((c) => c.id === params.cardId);
        if (!card) return old;

        card.columnId = params.destinationColumnId;
        return newCards;
      });

      return { previousCards };
    },
    onError: (err, params, context) => {
      queryClient.setQueryData(['kanban', 'cards'], context?.previousCards);
      toast.error('Failed to move card');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban', 'cards'] });
    },
  });

  return {
    columns,
    cards,
    isLoading: isLoadingColumns || isLoadingCards,
    moveCard,
  };
}