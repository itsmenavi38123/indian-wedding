'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Calendar, CheckCircle2, IndianRupee, ListTodo, Users } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Link from 'next/link';

const DashboardPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const admin = user?.role === 'ADMIN' ? user : '';

  return (
    <div className="p-1 sm:p-2 lg:p-4 space-y-6 w-full">
      {/* Welcome Message */}
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Welcome back, <span className="text-gold">{admin?.name ?? '-'}</span>
          {`! Here's what's happening today`}
        </h1>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Weddings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              12 <ArrowUpRight className="h-4 w-4 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{`This Month's Revenue`}</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹1,20,000</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <a href="#" className="text-xs text-primary underline">
              View All
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>{`Today's Schedule`}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {[
                {
                  time: '10:00 AM',
                  event: 'Engagement Ceremony',
                  client: 'Ravi & Priya',
                  venue: 'Taj Palace',
                },
                { time: '2:00 PM', event: 'Vendor Meeting', client: '--', venue: 'Office' },
                {
                  time: '6:00 PM',
                  event: 'Reception Setup',
                  client: 'Arjun & Meera',
                  venue: 'Leela Hotel',
                },
              ].map((item, idx) => (
                <li key={idx} className={`flex items-start gap-4 ${idx !== 2 && 'border-b'} pb-2`}>
                  <span className="text-sm font-medium text-gold w-20">{item.time}</span>
                  <div>
                    <p className="font-medium">{item.event}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.client} • {item.venue}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <a href="#" className="text-xs text-primary underline">
              View All Activity
            </a>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                { type: 'New Lead', desc: 'Lead from website form', time: '2h ago' },
                { type: 'Payment Received', desc: '₹25,000 from Meera', time: '5h ago' },
                { type: 'Task Completed', desc: 'Finalized catering menu', time: '1d ago' },
              ].map((act, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-white mt-1" />
                  <div>
                    <p className="text-sm font-medium">{act.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {act.desc} • {act.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link href={'/admin/leads/add'}>
          <Button
            variant={'outline'}
            className=" hover:bg-[var(--black-bg)] bg-gold border border-[#e5e5e521] hover:text-white text-white"
          >
            Add New Lead
          </Button>
        </Link>
        <Button
          variant={'outline'}
          className=" bg-[var(--black-bg)] hover:bg-gold border border-[#e5e5e521] text-white hover:text-white"
        >
          Create Task
        </Button>
        <Button
          variant={'outline'}
          className=" bg-[var(--black-bg)] hover:bg-gold border border-[#e5e5e521] text-white hover:text-white"
        >
          Record Payment
        </Button>
      </div>
    </div>
  );
};

export default DashboardPage;
