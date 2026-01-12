'use client';

import { EventFilters as EventFiltersType } from '@/types/events';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EventFiltersProps {
  filters: EventFiltersType;
  onFiltersChange: (filters: EventFiltersType) => void;
}

export default function EventFilters({ filters, onFiltersChange }: EventFiltersProps) {
  const handleReset = () => {
    onFiltersChange({
      status: undefined,
      search: '',
      dateFrom: undefined,
      dateTo: undefined,
      isFeatured: undefined,
    });
  };

  return (
    <Card className="font-outfit">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => onFiltersChange({ ...filters, status: value === 'all' ? undefined : value as any })}
            >
              <SelectTrigger id="status-filter" className="w-full">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date From Filter */}
          <div className="space-y-2">
            <Label htmlFor="date-from">From Date</Label>
            <Input
              id="date-from"
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value || undefined })}
            />
          </div>

          {/* Date To Filter */}
          <div className="space-y-2">
            <Label htmlFor="date-to">To Date</Label>
            <Input
              id="date-to"
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value || undefined })}
            />
          </div>

          {/* Featured Filter */}
          <div className="space-y-2">
            <Label>Featured Only</Label>
            <div className="flex items-center space-x-2 h-10">
              <Checkbox
                id="featured-filter"
                checked={filters.isFeatured || false}
                onCheckedChange={(checked) => onFiltersChange({ ...filters, isFeatured: checked ? true : undefined })}
              />
              <Label htmlFor="featured-filter" className="text-sm font-normal cursor-pointer">
                Show only featured events
              </Label>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleReset}
            variant="outline"
            size="default"
          >
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
