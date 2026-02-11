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
import { SponsorshipRegistration, SponsorshipTier } from '@/types/sponsorship';
import {
  Download,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Users,
  FileCheck,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';

interface SponsorshipRegistrationsManagerProps {
  event: { id: string; title: string };
  registrations: SponsorshipRegistration[];
  tiers: SponsorshipTier[];
}

export function SponsorshipRegistrationsManager({
  event,
  registrations: initialRegistrations,
  tiers,
}: SponsorshipRegistrationsManagerProps) {
  const supabase = createClient();
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');

  // Calculate statistics
  const stats = useMemo(() => {
    const total = registrations.length;
    const completed = registrations.filter((r) => r.payment_status === 'completed').length;
    const pending = registrations.filter((r) => r.payment_status === 'pending').length;
    const failed = registrations.filter((r) => r.payment_status === 'failed').length;
    const contractSigned = registrations.filter((r) => r.contract_signed).length;
    const totalRevenue = registrations
      .filter((r) => r.payment_status === 'completed')
      .reduce((sum, r) => sum + r.price_amount, 0);

    return { total, completed, pending, failed, contractSigned, totalRevenue };
  }, [registrations]);

  // Filter registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      // Search filter
      const matchesSearch =
        reg.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.phone_number.includes(searchTerm);

      // Status filter
      const matchesStatus = statusFilter === 'all' || reg.payment_status === statusFilter;

      // Tier filter
      const matchesTier = tierFilter === 'all' || reg.tier_id === tierFilter;

      return matchesSearch && matchesStatus && matchesTier;
    });
  }, [registrations, searchTerm, statusFilter, tierFilter]);

  // Export to CSV
  const handleExport = () => {
    const headers = [
      'Registration ID',
      'Company Name',
      'Contact Person',
      'Email',
      'Phone',
      'Website',
      'Industry',
      'Tier',
      'Amount',
      'Payment Status',
      'Contract Signed',
      'Registration Date',
    ];

    const rows = filteredRegistrations.map((reg) => {
      const tier = tiers.find((t) => t.id === reg.tier_id);
      return [
        reg.id,
        reg.company_name,
        reg.contact_person,
        reg.email,
        reg.phone_number,
        reg.company_website || '',
        reg.industry || '',
        tier?.tier_name || 'N/A',
        reg.price_amount,
        reg.payment_status,
        reg.contract_signed ? 'Yes' : 'No',
        reg.created_at ? new Date(reg.created_at).toLocaleString() : 'N/A',
      ];
    });

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, '-')}-sponsorships-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Mark contract as signed
  const handleMarkContractSigned = async (registrationId: string) => {
    try {
      const { error } = await supabase
        .from('event_sponsorship_registrations' as any)
        .update({
          contract_signed: true,
          contract_signed_at: new Date().toISOString(),
        })
        .eq('id', registrationId);

      if (error) throw error;

      setRegistrations(
        registrations.map((r) =>
          r.id === registrationId
            ? { ...r, contract_signed: true, contract_signed_at: new Date().toISOString() }
            : r
        )
      );

      toast.success('Contract marked as signed');
    } catch (error) {
      console.error('Error updating contract status:', error);
      toast.error('Failed to update contract status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
        <p className="text-muted-foreground">Manage event sponsorship registrations</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sponsorships</p>
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
                <p className="text-sm text-muted-foreground">Contracts Signed</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.contractSigned} / {stats.completed}
                </p>
              </div>
              <FileCheck className="w-8 h-8 text-blue-600" />
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
                  placeholder="Search by company, contact, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || 'all')}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* Tier Filter */}
            <Select value={tierFilter} onValueChange={(value) => setTierFilter(value || 'all')}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                {tiers.map((tier) => (
                  <SelectItem key={tier.id} value={tier.id}>
                    {tier.tier_name}
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
          <CardTitle>Sponsorship Registrations ({filteredRegistrations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Company</th>
                  <th className="text-left p-3 font-medium">Contact</th>
                  <th className="text-left p-3 font-medium">Tier</th>
                  <th className="text-left p-3 font-medium">Amount</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Contract</th>
                  <th className="text-left p-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-muted-foreground">
                      No sponsorship registrations found
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((reg) => {
                    const tier = tiers.find((t) => t.id === reg.tier_id);
                    return (
                      <tr key={reg.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{reg.company_name}</p>
                            {reg.industry && (
                              <p className="text-sm text-muted-foreground">{reg.industry}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">
                            <p className="font-medium">{reg.contact_person}</p>
                            <p className="text-muted-foreground">{reg.email}</p>
                            <p className="text-muted-foreground">{reg.phone_number}</p>
                          </div>
                        </td>
                        <td className="p-3 text-sm">
                          <Badge variant="outline">{tier?.tier_name || 'N/A'}</Badge>
                        </td>
                        <td className="p-3 font-medium">KES {reg.price_amount.toLocaleString()}</td>
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
                          {reg.contract_signed ? (
                            <Badge className="bg-blue-500">Signed</Badge>
                          ) : reg.payment_status === 'completed' ? (
                            <Button
                              onClick={() => handleMarkContractSigned(reg.id)}
                              variant="outline"
                              size="sm"
                            >
                              Mark Signed
                            </Button>
                          ) : (
                            <Badge variant="outline">N/A</Badge>
                          )}
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {reg.created_at ? new Date(reg.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    );
                  })
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => (window.location.href = `/admin/pages/events/${event.id}/sponsorship-tiers`)}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Manage Sponsorship Tiers
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => (window.location.href = `/admin/pages/events/${event.id}`)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Back to Event Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
