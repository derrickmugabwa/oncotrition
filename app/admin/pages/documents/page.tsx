'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentsTab from "@/components/admin/smartspoon/DocumentsTab";

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h1>
      </div>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="w-full max-w-[400px]">
          <TabsTrigger value="documents" className="flex-1">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="documents">
          <DocumentsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
