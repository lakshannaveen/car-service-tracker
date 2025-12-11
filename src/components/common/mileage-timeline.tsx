import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gauge, TrendingUp, AlertTriangle, CheckCircle, Flag, Target } from "lucide-react"

interface ServiceRecord {
  recordId?: string
  serviceType: string
  serviceDate: string
  mileage?: number
  description?: string
}

interface MileageTimelineProps {
  records: ServiceRecord[]
}

interface ComponentServiceStatus {
  component: string
  lastServicedMileage: number
  lastServicedDate: string
  currentMileage: number
  mileageSinceService: number
  recommendedInterval: number
  needsService: boolean
  serviceUrgent: boolean
}

// Define service intervals for each component (in miles)
const COMPONENT_SERVICE_INTERVALS: Record<string, number> = {
  "oil filter": 5000,
  "air filter": 5000,
  "engine oil": 5000,
  "brake pads": 20000,
  "brake fluid": 30000,
  "spark plugs": 30000,
  "timing belt": 60000,
  "transmission fluid": 60000,
  "cabin air filter": 15000,
  "tire rotation": 7500,
}

// Mapping for service type names to component names
const SERVICE_TYPE_TO_COMPONENT: Record<string, string> = {
  "oil change": "engine oil",
  "oil filter": "oil filter",
  "air filter replacement": "air filter",
  "cabin air filter replacement": "cabin air filter",
  "tire rotation": "tire rotation",
  "brake service": "brake pads",
  "brake fluid": "brake fluid",
  "spark plugs": "spark plugs",
  "timing belt": "timing belt",
  "transmission service": "transmission fluid",
  "transmission fluid": "transmission fluid",
}

export function MileageTimeline({ records }: MileageTimelineProps) {
  const [localRecords, setLocalRecords] = useState<ServiceRecord[]>([])
  const [componentStatus, setComponentStatus] = useState<ComponentServiceStatus[]>([])

  // Load records and calculate component status
  useEffect(() => {
    setLocalRecords(records)
    calculateComponentServiceStatus(records)
  }, [records])

  const calculateComponentServiceStatus = (serviceRecords: ServiceRecord[]) => {
    // Filter + sort valid mileage records chronologically
    const recordsWithMileage = serviceRecords
      .filter((r) => r.mileage != null && r.mileage > 0)
      .sort(
        (a, b) =>
          new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime()
      )

    if (recordsWithMileage.length === 0) {
      setComponentStatus([])
      return
    }

    const latestMileage = recordsWithMileage[recordsWithMileage.length - 1]?.mileage || 0
    
    // Track last service for each component
    const componentLastService: Map<string, { mileage: number; date: string }> = new Map()

    // Process records in chronological order to find most recent service for each component
    recordsWithMileage.forEach((record) => {
      const serviceDate = new Date(record.serviceDate).toISOString()
      const mileage = record.mileage || 0
      
      // Extract serviced components from the record
      const servicedComponents = extractServicedComponents(record)
      
      servicedComponents.forEach(component => {
        componentLastService.set(component, {
          mileage,
          date: serviceDate
        })
      })
    })

    // Calculate status for each tracked component
    const status: ComponentServiceStatus[] = Object.keys(COMPONENT_SERVICE_INTERVALS).map(component => {
      const lastService = componentLastService.get(component)
      const recommendedInterval = COMPONENT_SERVICE_INTERVALS[component]
      
      if (!lastService) {
        // Component never serviced - recommend service
        return {
          component,
          lastServicedMileage: 0,
          lastServicedDate: "Never serviced",
          currentMileage: latestMileage,
          mileageSinceService: latestMileage,
          recommendedInterval,
          needsService: latestMileage >= recommendedInterval,
          serviceUrgent: latestMileage >= recommendedInterval
        }
      }

      const mileageSinceService = latestMileage - lastService.mileage
      const needsService = mileageSinceService >= recommendedInterval

      return {
        component,
        lastServicedMileage: lastService.mileage,
        lastServicedDate: new Date(lastService.date).toLocaleDateString(),
        currentMileage: latestMileage,
        mileageSinceService,
        recommendedInterval,
        needsService,
        serviceUrgent: needsService
      }
    })

    setComponentStatus(status)
  }

  // Helper function to extract serviced components from a record
  const extractServicedComponents = (record: ServiceRecord): string[] => {
    const components: string[] = []
    const serviceTypeLower = (record.serviceType || '').toLowerCase()
    const descriptionLower = (record.description || '').toLowerCase()
    const searchText = `${serviceTypeLower} ${descriptionLower}`
    
    // First, check if serviceType matches any mapping
    for (const [key, value] of Object.entries(SERVICE_TYPE_TO_COMPONENT)) {
      if (serviceTypeLower.includes(key) && !components.includes(value)) {
        components.push(value)
      }
    }
    
    // Then, check all components in defined intervals against combined text
    Object.keys(COMPONENT_SERVICE_INTERVALS).forEach(component => {
      if (searchText.includes(component.toLowerCase()) && !components.includes(component)) {
        components.push(component)
      }
    })

    return components
  }

  if (!localRecords || localRecords.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            Mileage History
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6 text-muted-foreground">
          <p>No mileage data recorded yet</p>
        </CardContent>
      </Card>
    )
  }

  // Filter + sort valid mileage for timeline display
  const recordsWithMileage = localRecords
    .filter((r) => r.mileage != null && r.mileage > 0)
    .sort(
      (a, b) =>
        new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime()
    )

  if (recordsWithMileage.length === 0) {
    // If no mileage data, still show component status if available
    if (componentStatus.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Gauge className="w-5 h-5" />
              Mileage History
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-6 text-muted-foreground">
            <p>No mileage data recorded yet</p>
          </CardContent>
        </Card>
      )
    }
    
    // Show only component status without mileage history
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            Component Status
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Component Service Status - Compact grid layout */}
          {componentStatus.length > 0 && (
            <div>
              <h4 className="font-semibold text-xs mb-2 flex items-center gap-2">
                <CheckCircle className="w-3 h-3" />
                Service Status
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {componentStatus.map((status) => {
                  const isUrgent = status.serviceUrgent
                  const percentage = Math.min(100, (status.mileageSinceService / status.recommendedInterval) * 100)
                  
                  return (
                    <div
                      key={status.component}
                      className={`p-2 rounded-lg border text-xs ${
                        isUrgent
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-green-50 border-green-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium capitalize text-xs truncate">{status.component}</span>
                        {isUrgent ? (
                          <AlertTriangle className="w-3 h-3 text-red-600 flex-shrink-0 ml-1" />
                        ) : (
                          <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 ml-1" />
                        )}
                      </div>
                      
                      {/* Mileage display */}
                      <div className="mb-1 text-xs font-semibold text-gray-800">
                        <span className="text-sm">{status.mileageSinceService.toLocaleString()}</span>
                        <span className="text-[10px] text-gray-600">/{status.recommendedInterval.toLocaleString()}</span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full bg-gray-300 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${isUrgent ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      
                      <div className="mt-1 text-[10px] text-gray-600">
                        {percentage.toFixed(0)}%
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Calculate mileage details for timeline
  const mileageData = recordsWithMileage.map((record, index) => {
    const prevRecord = index > 0 ? recordsWithMileage[index - 1] : null
    const mileageDiff = prevRecord
      ? (record.mileage || 0) - (prevRecord.mileage || 0)
      : 0

    return {
      record,
      mileageDiff,
      date: new Date(record.serviceDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      servicedComponents: extractServicedComponents(record)
    }
  }).filter(data => data.record.mileage != null && data.record.mileage > 0)

  const latestMileage = recordsWithMileage[recordsWithMileage.length - 1]?.mileage || 0
  const oldestMileage = recordsWithMileage[0]?.mileage || 0
  const totalMileage = latestMileage - oldestMileage

  const componentsNeedingService = componentStatus.filter(status => status.serviceUrgent)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            Mileage History
          </CardTitle>
          <Badge variant="secondary" className="gap-1 w-fit">
            <TrendingUp className="w-3 h-3" />
            {totalMileage.toLocaleString()} mi tracked
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mileage Summary - Moved to top and made compact */}
        {recordsWithMileage.length > 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Flag className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">First</p>
                <p className="text-lg font-bold text-blue-700">{oldestMileage.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Latest</p>
                <p className="text-lg font-bold text-green-700">{latestMileage.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Service Alerts - Compact banner style */}
        {componentsNeedingService.length > 0 && (
          <div className="p-3 border-l-4 border-red-500 bg-red-50 rounded">
            <p className="font-semibold text-sm text-red-800 flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4" />
              {componentsNeedingService.length} Component{componentsNeedingService.length > 1 ? 's' : ''} Need Service
            </p>
            <p className="text-xs text-red-700">
              {componentsNeedingService.map(s => s.component).join(', ')}
            </p>
          </div>
        )}

        {/* Component Service Status - Compact grid layout */}
        {componentStatus.length > 0 && (
          <div>
            <h4 className="font-semibold text-xs mb-2 flex items-center gap-2">
              <CheckCircle className="w-3 h-3" />
              Component Status
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {componentStatus.map((status) => {
                const isUrgent = status.serviceUrgent
                const percentage = Math.min(100, (status.mileageSinceService / status.recommendedInterval) * 100)
                
                return (
                  <div
                    key={status.component}
                    className={`p-2 rounded-lg border text-xs ${
                      isUrgent
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium capitalize text-xs truncate">{status.component}</span>
                      {isUrgent ? (
                        <AlertTriangle className="w-3 h-3 text-red-600 flex-shrink-0 ml-1" />
                      ) : (
                        <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 ml-1" />
                      )}
                    </div>
                    
                    {/* Mileage display */}
                    <div className="mb-1 text-xs font-semibold text-gray-800">
                      <span className="text-sm">{status.mileageSinceService.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-600">/{status.recommendedInterval.toLocaleString()}</span>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-gray-300 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${isUrgent ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    <div className="mt-1 text-[10px] text-gray-600">
                      {percentage.toFixed(0)}%
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// garuka code 
// 

// import type { ServiceRecord } from "@/services"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Gauge, TrendingUp } from "lucide-react"

// interface MileageTimelineProps {
//   records: ServiceRecord[]
// }

// export function MileageTimeline({ records }: MileageTimelineProps) {
//   // Filter records with mileage and sort by date
//   const recordsWithMileage = records
//     .filter((r) => r.mileage != null && r.mileage > 0)
//     .sort((a, b) => new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime())

//   if (recordsWithMileage.length === 0) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-base flex items-center gap-2">
//             <Gauge className="w-5 h-5" />
//             Mileage History
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="text-center py-6 text-muted-foreground">
//           <p>No mileage data recorded yet</p>
//         </CardContent>
//       </Card>
//     )
//   }

//   // Calculate mileage differences
//     const mileageData = recordsWithMileage.map((record, index) => {
//     const prevRecord = index > 0 ? recordsWithMileage[index - 1] : null
//     const mileageDiff = prevRecord ? (record.mileage || 0) - (prevRecord.mileage || 0) : 0

//     return {
//       record,
//       mileageDiff,
//       date: new Date(record.serviceDate).toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         year: "numeric",
//       }),
//     }
//   })

//   const latestMileage = recordsWithMileage[recordsWithMileage.length - 1]?.mileage || 0
//   const oldestMileage = recordsWithMileage[0]?.mileage || 0
//   const totalMileage = latestMileage - oldestMileage

//   return (
//     <Card>
//       <CardHeader>
//         <div className="flex items-center justify-between">
//           <CardTitle className="text-base flex items-center gap-2">
//             <Gauge className="w-5 h-5" />
//             Mileage History
//           </CardTitle>
//           <Badge variant="secondary" className="gap-1">
//             <TrendingUp className="w-3 h-3" />
//             {totalMileage.toLocaleString()} mi tracked
//           </Badge>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-3">
//           {mileageData.reverse().map(({ record, mileageDiff, date }, index) => (
//             <div
//               key={record.recordId || index}
//               className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
//             >
//               <div className="flex-1">
//                 <p className="font-medium text-sm">{record.serviceType}</p>
//                 <p className="text-xs text-muted-foreground">{date}</p>
//               </div>
//               <div className="text-right">
//                 <p className="font-semibold">{(record.mileage || 0).toLocaleString()} mi</p>
//                 {mileageDiff > 0 && (
//                   <p className="text-xs text-muted-foreground">+{mileageDiff.toLocaleString()} mi</p>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>

//         {recordsWithMileage.length > 1 && (
//           <div className="mt-4 p-3 bg-muted/50 rounded-lg">
//             <div className="grid grid-cols-2 gap-4 text-center">
//               <div>
//                 <p className="text-xs text-muted-foreground mb-1">First Recorded</p>
//                 <p className="font-semibold">{oldestMileage.toLocaleString()} mi</p>
//               </div>
//               <div>
//                 <p className="text-xs text-muted-foreground mb-1">Latest Recorded</p>
//                 <p className="font-semibold">{latestMileage.toLocaleString()} mi</p>
//               </div>
//             </div>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   )
// }