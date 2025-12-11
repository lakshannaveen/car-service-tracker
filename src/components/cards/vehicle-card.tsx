import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Car,
  Calendar,
  FileText,
  MoreVertical,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

interface Vehicle {
  vehicleId?: string;
  make: string;
  model: string;
  licensePlate: string;
  year: number;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicleId: string) => void;
  onViewHistory: (vehicleId: string) => void;
}

export function VehicleCard({
  vehicle,
  onEdit,
  onDelete,
  onViewHistory,
}: VehicleCardProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleDropdownAction = (action: () => void) => {
    setMenuOpen(false);
    setTimeout(() => action(), 0);
  };

  return (
    <Card
      className="
        relative overflow-hidden rounded-3xl border border-violet-300/40 
        bg-white/80 dark:bg-slate-900/70 
        backdrop-blur-xl shadow-md hover:shadow-xl 
        transition-all duration-300 hover:-translate-y-1
      "
    >
      <CardContent className="p-6 pb-4">
        <div className="flex items-start justify-between mb-6">
          
          {/* Left Section */}
          <div className="flex items-start gap-4">

            {/* Car Icon in Circle */}
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <Car className="w-7 h-7 text-primary-foreground" />
            </div>

            {/* Title + Badge */}
            <div>
              <h3 className="font-bold text-xl text-slate-900 dark:text-white tracking-wide">
                {vehicle.make} {vehicle.model}
              </h3>

              <span
                className="
                  inline-block px-3 py-1 mt-2 
                  rounded-full text-xs font-medium
                  bg-slate-100 dark:bg-slate-800
                  text-slate-600 dark:text-slate-400
                "
              >
                {vehicle.licensePlate}
              </span>
            </div>
          </div>

          {/* Dropdown Menu */}
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="
                  rounded-full 
                  hover:bg-slate-100/60 dark:hover:bg-slate-800/70
                "
              >
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-48 rounded-xl shadow-lg"
            >
              <DropdownMenuItem
                onClick={() => handleDropdownAction(() => onEdit(vehicle))}
                className="cursor-pointer"
              >
                Edit Vehicle
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  handleDropdownAction(() => onDelete(vehicle.vehicleId!))
                }
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                Delete Vehicle
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Year section */}
        <div
          className="
            flex items-center gap-2 px-3 py-2 w-fit
            rounded-xl bg-slate-100 dark:bg-slate-800
          "
        >
          <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {vehicle.year}
          </span>
        </div>
      </CardContent>

      {/* Footer Buttons */}
      <CardFooter className="p-4 pt-2 flex gap-4">
        <Link to={`/add-service/${vehicle.vehicleId}`} className="flex-1">
          <Button
            variant="outline"
            className="
              w-full flex items-center gap-2 rounded-xl  
              border-violet-300 dark:border-violet-700 
              text-violet-700 dark:text-violet-300 
              hover:bg-violet-600 hover:text-white
              transition-all duration-300
            "
          >
            <Plus className="w-5 h-5" />
            Add Service
          </Button>
        </Link>

        <Button
          variant="outline"
          onClick={() => onViewHistory(vehicle.vehicleId!)}
          className="
            flex-1 w-full flex items-center gap-2 rounded-xl  
            border-slate-300 dark:border-slate-700
            text-slate-700 dark:text-slate-200
            hover:bg-violet-600 hover:text-white 
            transition-all duration-300
          "
        >
          <FileText className="w-5 h-5" />
          History
        </Button>
      </CardFooter>
    </Card>
  );
}
