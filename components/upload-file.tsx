import { FileIcon, X } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

import { UploadButton, UploadDropzone } from '@/lib/uploadthing'
import { Button } from './ui/button'
import "@uploadthing/react/styles.css";

type Props = {
  apiEndpoint: 'image' | 'payslipfile' 
  onChange: (url?: string) => void
  value?: string
  className?: string
}

const FileUpload = ({ apiEndpoint, onChange, value }: Props) => {
  const type = value?.split('.').pop()

  if (value) {
    return (
      <div className="flex">
        {type !== 'pdf' ? (
          <div className="relative w-auto h-auto items-center">
            <Image
              src={value}
              alt="uploaded image"
              className="object-contain"
              width={400}
              height={250}
              onClick={() => onChange('')}
            />
          </div>
        ) : (
          <div className="relative flex items-center p-2 mt-2 rounded-md">
            <FileIcon className='h-4 w-4' />
            <a
              href={value}
              target="_blank"
              rel="noopener_noreferrer"
              className="ml-2 text-sm"
            >
              View PDF
            </a>
          </div>
        )}

      </div>
      
    )
  }
  return (
    <div className="w-full items-center">
      <UploadDropzone
     appearance={{
      button:
        "ut-ready:bg-green-500 ut-uploading:cursor-not-allowed rounded-r-none bg-blue-500 bg-none after:bg-blue-400 mb-2",
      container: "w-auto h-15",
      allowedContent:
        "flex h-2 flex-col justify-center px-2 text-white",
    }}
        endpoint={apiEndpoint}
        onClientUploadComplete={(res) => {
          onChange(res?.[0].url)
        }}
        onUploadError={(error: Error) => {
          console.log(error)
        }}
      />
    </div>
  )
}

export default FileUpload
