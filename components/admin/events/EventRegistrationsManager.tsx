'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Event } from '@/types/events';
import { NutrivibeRegistration, NutrivibePricing } from '@/types/nutrivibe';
import { 
  Download, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  XCircle,
  Mail,
  QrCode,
  Calendar,
  DollarSign,
  Users
} from 'lucide-react';

interface EventRegistrationsManagerProps {
  event: Event;
  registrations: NutrivibeRegistration[];
  pricing: NutrivibePricing[];
}

export function EventRegistrationsManager({
  event,
  registrations,
  pricing,
}: EventRegistrationsManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Calculate statistics
  const stats = useMemo(() => {
    const total = registrations.length;
    const completed = registrations.filter(r => r.payment_status === 'completed').length;
    const pending = registrations.filter(r => r.payment_status === 'pending').length;
    const failed = registrations.filter(r => r.payment_status === 'failed').length;
    const checkedIn = registrations.filter(r => r.checked_in).length;
    const totalRevenue = registrations
      .filter(r => r.payment_status === 'completed')
      .reduce((sum, r) => sum + r.price_amount, 0);

    return { total, completed, pending, failed, checkedIn, totalRevenue };
  }, [registrations]);

  // Filter registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(reg => {
      // Search filter
      const matchesSearch = 
        reg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.phone_number.includes(searchTerm);

      // Status filter
      const matchesStatus = 
        statusFilter === 'all' || reg.payment_status === statusFilter;

      // Type filter
      const matchesType = 
        typeFilter === 'all' || reg.participation_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [registrations, searchTerm, statusFilter, typeFilter]);

  // Export to CSV
  const handleExport = () => {
    const headers = [
      'Registration ID',
      'Name',
      'Email',
      'Phone',
      'Organization',
      'Designation',
      'Participation Type',
      'Amount',
      'Payment Status',
      'Checked In',
      'Registration Date',
    ];

    const rows = filteredRegistrations.map(reg => [
      reg.id,
      reg.full_name,
      reg.email,
      reg.phone_number,
      reg.organization || '',
      reg.designation || '',
      reg.participation_type,
      reg.price_amount,
      reg.payment_status,
      reg.checked_in ? 'Yes' : 'No',
      new Date(reg.created_at).toLocaleString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, '-')}-registrations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get unique participation types
  const participationTypes = useMemo(() => {
    return Array.from(new Set(registrations.map(r => r.participation_type)));
  }, [registrations]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
        <p className="text-muted-foreground">Manage event registrations and check-ins</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Registrations</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-[#009688]">
                  KES {stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-[#009688]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Checked In</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.checkedIn} / {stats.completed}
                </p>
              </div>
              <QrCode className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Participation Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {participationTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Export Button */}
            <Button onClick={handleExport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Registrations ({filteredRegistrations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Phone</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Amount</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Check-in</th>
                  <th className="text-left p-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-muted-foreground">
                      No registrations found
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{reg.full_name}</p>
                          {reg.organization && (
                            <p className="text-sm text-muted-foreground">{reg.organization}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm">{reg.email}</td>
                      <td className="p-3 text-sm">{reg.phone_number}</td>
                      <td className="p-3 text-sm">
                        {reg.participation_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </td>
                      <td className="p-3 font-medium">
                        KES {reg.price_amount.toLocaleString()}
                      </td>
                      <td className="p-3">
                        {reg.payment_status === 'completed' && (
                          <Badge className="bg-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Paid
                          </Badge>
                        )}
                        {reg.payment_status === 'pending' && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                        {reg.payment_status === 'failed' && (
                          <Badge variant="destructive">
                            <XCircle className="w-3 h-3 mr-1" />
                            Failed
                          </Badge>
                        )}
                      </td>
                      <td className="p-3">
                        {reg.checked_in ? (
                          <Badge className="bg-blue-500">Checked In</Badge>
                        ) : (
                          <Badge variant="outline">Not Yet</Badge>
                        )}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {new Date(reg.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start" asChild>
              <a href={`/admin/pages/events/${event.id}/pricing`}>
                <DollarSign className="w-4 h-4 mr-2" />
                Manage Pricing
              </a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href={`/admin/pages/events/${event.id}/interest-areas`}>
                <Filter className="w-4 h-4 mr-2" />
                Manage Interest Areas
              </a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href={`/admin/pages/events/${event.id}/check-in`}>
                <QrCode className="w-4 h-4 mr-2" />
                QR Scanner Check-in
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
