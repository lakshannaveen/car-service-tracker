import type { ServiceRecord, Attachment } from "@/lib/api"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  DollarSign,
  Wrench,
  MoreVertical,
  Paperclip,
  Gauge,
  Receipt
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useState } from "react"

interface ServiceRecordCardProps {
  record: ServiceRecord
  attachments?: Attachment[]
  onEdit: (record: ServiceRecord) => void
  onDelete: (recordId: string) => void
  onViewAttachments?: (recordId: string) => void
  onViewBreakdown?: (recordId: string) => void
}

export function ServiceRecordCard({
  record,
  attachments,
  onEdit,
  onDelete,
  onViewAttachments,
  onViewBreakdown
}: ServiceRecordCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const formattedDate = (() => {
    const date = new Date(record.serviceDate)
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}/${String(date.getDate()).padStart(2, "0")}`
  })()

  const attachmentCount = attachments?.length || 0
  const breakdownCount = record.costBreakdowns?.length || 0

  const handleMenuAction = (action: () => void) => {
    setMenuOpen(false)
    setTimeout(() => action(), 0)
  }

  return (
    <Card
      className="
        relative overflow-hidden rounded-3xl 
        border border-violet-300/40 bg-white/80 dark:bg-slate-900/70
        backdrop-blur-xl shadow-md hover:shadow-xl 
        transition-all duration-300 hover:-translate-y-1
      "
    >
      <CardContent className="p-6 pb-4">
        {/* Top Row */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            {/* Icon circle */}
            <div
              className="
                w-16 h-16 rounded-full flex items-center justify-center shadow-lg
                bg-violet-600 text-white
              "
            >
              <Wrench className="w-7 h-7" />
            </div>

            {/* Title block */}
            <div>
              <h3 className="font-bold text-xl text-slate-900 dark:text-white tracking-wide">
                {record.serviceType}
              </h3>

              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                {record.providerName}
              </p>

              {/* Date Badge */}
              <span
                className="
                  inline-block px-3 py-1 mt-3 rounded-full text-xs font-medium 
                  bg-slate-100 dark:bg-slate-800 
                  text-slate-600 dark:text-slate-400
                "
              >
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Dropdown menu */}
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-slate-100/60 dark:hover:bg-slate-800/70"
              >
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-48 rounded-xl shadow-lg"
            >
              <DropdownMenuItem
                onClick={() => handleMenuAction(() => onEdit(record))}
                className="cursor-pointer"
              >
                Edit Record
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  handleMenuAction(() => onDelete(record.recordId!))
                }
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                Delete Record
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Price + Mileage Row */}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <DollarSign className="w-4 h-4" />
            <span>Rs.{record.cost.toFixed(2)}</span>
          </div>

          {record.mileage && (
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Gauge className="w-4 h-4" />
              <span>{record.mileage.toLocaleString()} km</span>
            </div>
          )}
        </div>

        {/* Description */}
        {record.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 my-4 line-clamp-2">
            {record.description}
          </p>
        )}

        {/* Badge Row */}
        <div className="flex gap-2 flex-wrap mt-2">
          {breakdownCount > 0 && (
            <Badge className="bg-violet-100 text-violet-700 border-0">
              💰 {breakdownCount} items
            </Badge>
          )}
          {attachmentCount > 0 && (
            <Badge className="bg-purple-200 text-purple-700 border-0">
              📎 {attachmentCount} files
            </Badge>
          )}
        </div>
      </CardContent>

      {/* Footer Buttons */}
      {(breakdownCount > 0 || attachmentCount > 0) && (
        <CardFooter className="p-4 pt-2 flex gap-4">
          {breakdownCount > 0 && (
            <Button
              variant="outline"
              className="
                flex-1 rounded-xl border-violet-300 text-violet-700 
                hover:bg-violet-600 hover:text-white transition-all duration-300
              "
              onClick={() => onViewBreakdown?.(record.recordId!)}
            >
              <Receipt className="w-4 h-4 mr-2" />
              Breakdown
            </Button>
          )}

          {attachmentCount > 0 && (
            <Button
              variant="outline"
              className="
                flex-1 rounded-xl border-slate-300 text-slate-700 
                hover:bg-violet-600 hover:text-white transition-all duration-300
              "
              onClick={() => onViewAttachments?.(record.recordId!)}
            >
              <Paperclip className="w-4 h-4 mr-2" />
              Attachments
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
