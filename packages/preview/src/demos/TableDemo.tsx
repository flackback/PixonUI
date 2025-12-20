import React, { useState } from 'react';
import type {
  Column} from '@pixonui/react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
  DataTable,
  Switch,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Button,
  Badge,
  Avatar,
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  ChartContainer,
  AreaChart,
  ChartTooltip,
  Heading,
  Text,
  Surface
} from '@pixonui/react';
import { MoreHorizontal, Edit, Trash, Copy, Eye, Mail } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  access: boolean;
  lastActive: string;
  activity: number[];
}

export function TableDemo() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const users = [
    {
      id: '1',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      role: 'Admin',
      status: 'active',
      access: true,
      lastActive: '2 mins ago',
      activity: [20, 45, 30, 60, 55, 80, 75]
    },
    {
      id: '2',
      name: 'Alex Chen',
      email: 'alex@example.com',
      role: 'Editor',
      status: 'active',
      access: true,
      lastActive: '1 hour ago',
      activity: [40, 30, 50, 45, 70, 60, 90]
    },
    {
      id: '3',
      name: 'James Martin',
      email: 'james@example.com',
      role: 'Viewer',
      status: 'inactive',
      access: false,
      lastActive: '2 days ago',
      activity: [10, 15, 12, 20, 18, 25, 22]
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily@example.com',
      role: 'Editor',
      status: 'active',
      access: true,
      lastActive: '5 hours ago',
      activity: [30, 40, 35, 50, 45, 60, 55]
    }
  ];

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'User',
      sortable: true,
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <Avatar fallback={user.name[0]} className="h-8 w-8" />
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 dark:text-white group-hover:text-cyan-500 transition-colors">{user.name}</span>
            <span className="text-xs text-gray-500">{user.email}</span>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (user: User) => <span className="text-gray-700 dark:text-gray-300">{user.role}</span>
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (user: User) => (
        <Badge variant={user.status === 'active' ? 'success' : 'neutral'}>
          {user.status}
        </Badge>
      )
    },
    {
      key: 'access',
      header: 'Access',
      render: (user: User) => (
        <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          <Switch defaultChecked={user.access} />
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (user: User) => (
        <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" /> Edit User
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" /> Copy ID
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-500">
                <Trash className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ];

  const activityData = selectedUser?.activity.map((val: number, i: number) => ({
    label: `Day ${i + 1}`,
    value: val
  })) || [];

  return (
    <div className="space-y-8">
      {/* Simple Table (Existing) */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Simple Table</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">INV001</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Credit Card</TableCell>
              <TableCell className="text-right">$250.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">INV002</TableCell>
              <TableCell>Pending</TableCell>
              <TableCell>PayPal</TableCell>
              <TableCell className="text-right">$150.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">INV003</TableCell>
              <TableCell>Unpaid</TableCell>
              <TableCell>Bank Transfer</TableCell>
              <TableCell className="text-right">$350.00</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Advanced Table with DataTable */}
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <Heading as="h3">Advanced DataTable</Heading>
          <Text className="text-gray-500">High-performance table with built-in search, sort, and row actions.</Text>
        </div>
        
        <DataTable 
          data={users} 
          columns={columns} 
          searchKeys={['name', 'email', 'role']}
          onRowClick={setSelectedUser}
          maxHeight={400}
        />
      </div>

      {/* User Details Drawer */}
      <Drawer isOpen={!!selectedUser} onClose={() => setSelectedUser(null)}>
        <div className="h-full flex flex-col">
          <DrawerHeader>
            <div className="flex items-center gap-4 mb-2">
              <Avatar fallback={selectedUser?.name[0]} className="h-12 w-12" />
              <div>
                <DrawerTitle>{selectedUser?.name}</DrawerTitle>
                <DrawerDescription>{selectedUser?.email}</DrawerDescription>
              </div>
            </div>
          </DrawerHeader>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <Surface className="p-4">
                <Text className="text-xs text-white/50 uppercase font-bold mb-1">Role</Text>
                <Text className="font-medium">{selectedUser?.role}</Text>
              </Surface>
              <Surface className="p-4">
                <Text className="text-xs text-white/50 uppercase font-bold mb-1">Status</Text>
                <Badge variant={selectedUser?.status === 'active' ? 'success' : 'neutral'}>
                  {selectedUser?.status}
                </Badge>
              </Surface>
            </div>

            <div className="space-y-4">
              <Heading as="h4" className="text-sm font-bold uppercase tracking-wider text-white/40">
                Activity Overview
              </Heading>
              <Surface className="p-4 h-[250px]">
                <ChartContainer data={activityData} height={200}>
                  <AreaChart color="cyan" showValues={false} animationDelay={0.2} />
                  <ChartTooltip />
                </ChartContainer>
              </Surface>
              <Text className="text-xs text-white/40 text-center">
                User activity recorded over the last 7 days.
              </Text>
            </div>

            <div className="space-y-4">
              <Heading as="h4" className="text-sm font-bold uppercase tracking-wider text-white/40">
                Quick Actions
              </Heading>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" className="justify-start gap-2">
                  <Edit size={16} /> Edit Profile
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <Mail size={16} /> Send Message
                </Button>
                <Button variant="ghost" className="justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                  <Trash size={16} /> Suspend Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
