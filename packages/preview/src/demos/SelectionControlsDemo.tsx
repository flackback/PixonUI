import React from 'react';
import { Switch, Checkbox, Slider, Card, CardContent, CardHeader, CardTitle, CardDescription, Label } from '@pixonui/react';

export function SelectionControlsDemo() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Switch</CardTitle>
          <CardDescription>A control that allows the user to toggle between checked and not checked.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch id="airplane-mode" />
            <Label htmlFor="airplane-mode">Airplane Mode</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="bluetooth" defaultChecked />
            <Label htmlFor="bluetooth">Bluetooth</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Checkbox</CardTitle>
          <CardDescription>A control that allows the user to toggle between checked and not checked.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms">Accept terms and conditions</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="newsletter" defaultChecked />
            <Label htmlFor="newsletter">Subscribe to newsletter</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Slider</CardTitle>
          <CardDescription>An input where the user selects a value from within a given range.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <Slider defaultValue={50} max={100} step={1} />
          <Slider defaultValue={25} max={100} step={10} />
        </CardContent>
      </Card>
    </div>
  );
}
