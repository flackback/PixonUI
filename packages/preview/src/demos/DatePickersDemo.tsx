import React from 'react';
import { DatePicker, DateTimePicker, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@pixonui/react';

export function DatePickersDemo() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Date Picker</CardTitle>
          <CardDescription>A component that allows users to select a date.</CardDescription>
        </CardHeader>
        <CardContent>
          <DatePicker />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Date Time Picker</CardTitle>
          <CardDescription>A component that allows users to select a date and time.</CardDescription>
        </CardHeader>
        <CardContent>
          <DateTimePicker />
        </CardContent>
      </Card>
    </div>
  );
}
