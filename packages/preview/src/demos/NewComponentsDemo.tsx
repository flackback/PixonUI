import React from 'react';
import { 
  UserPreview, 
  Timeline, 
  TimelineItem, 
  FileDropzone, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardDescription
} from '@pixonui/react';
import { Check, AlertCircle, Clock } from 'lucide-react';

export function NewComponentsDemo() {
  return (
    <div className="space-y-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>User Preview</CardTitle>
          <CardDescription>A rich profile card for displaying user information.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <UserPreview 
            user={{
              name: "Sarah Wilson",
              role: "Product Designer",
              email: "sarah@pixon.ui",
              bio: "Passionate about building accessible and beautiful user interfaces.",
              stats: [
                { label: "Projects", value: 12 },
                { label: "Followers", value: "2.4k" },
                { label: "Following", value: 450 }
              ]
            }}
            onFollow={() => alert('Followed!')}
            onMessage={() => alert('Message sent!')}
          />
          
          <UserPreview 
            variant="glass"
            user={{
              name: "Alex Chen",
              role: "Senior Engineer",
              bio: "Full-stack developer loving React and TypeScript.",
              stats: [
                { label: "Commits", value: "8.5k" },
                { label: "PRs", value: 142 }
              ]
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>Vertical list for tracking events or history.</CardDescription>
        </CardHeader>
        <CardContent>
          <Timeline>
            <TimelineItem 
              status="success"
              title="Order Delivered"
              date="Just now"
              description="Package was handed to resident."
              icon={<Check className="h-3 w-3" />}
            />
            <TimelineItem 
              status="active"
              title="Out for Delivery"
              date="2 hours ago"
              description="Driver is on the way to your location."
              icon={<Clock className="h-3 w-3" />}
            />
            <TimelineItem 
              status="default"
              title="Order Processed"
              date="Yesterday"
              description="Your order has been packed and is ready for shipping."
            />
            <TimelineItem 
              status="error"
              title="Payment Failed"
              date="2 days ago"
              description="First attempt to charge card failed."
              icon={<AlertCircle className="h-3 w-3" />}
              isLast
            />
          </Timeline>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>File Dropzone</CardTitle>
          <CardDescription>Drag and drop area for file uploads.</CardDescription>
        </CardHeader>
        <CardContent>
          <FileDropzone 
            maxFiles={3}
            maxSize={5 * 1024 * 1024} // 5MB
            onDrop={(files: File[]) => console.log('Dropped files:', files)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
