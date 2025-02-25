import { 
  Building2, 
  Users, 
  FileText, 
  AlertTriangle,
  Bell,
  DollarSign,
  Wrench,
  Home,
  type LucideIcon 
} from 'lucide-react';
import { NotificationType } from '@prisma/client';

export function getNotificationIcon(type: NotificationType): LucideIcon {
  const icons: Record<NotificationType, LucideIcon> = {
    SYSTEM: Bell,
    MAINTENANCE: Wrench,
    LEASE: Building2,
    PAYMENT: DollarSign,
    DOCUMENT: FileText,
    SECURITY: AlertTriangle,
    UTILITY: Building2,
    TAX: DollarSign,
    PROPERTY: Building2,
    TENANT: Users,
    UNIT: Home,
  };

  return icons[type] || Bell;
} 