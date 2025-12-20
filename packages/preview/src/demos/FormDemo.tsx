import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Button, 
  TextInput, 
  Textarea, 
  Switch, 
  Select, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  useToast
} from '@pixonui/react';

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  bio: z.string().max(160).min(4),
  notifications: z.boolean().default(false).optional(),
  role: z.string().min(1, { message: "Please select a role." }),
});

type FormValues = z.infer<typeof formSchema>;

export function FormDemo() {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      bio: "",
      notifications: false,
    },
  });

  function onSubmit(data: FormValues) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-black/50 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Manage your public profile settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Username */}
          <Controller
            control={form.control}
            name="username"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <TextInput placeholder="pixon" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />

          {/* Email */}
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <TextInput placeholder="m@example.com" {...field} />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />

          {/* Bio */}
          <Controller
            control={form.control}
            name="bio"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell us a little bit about yourself" 
                    className="resize-none" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />

          {/* Role - Select */}
          <Controller
            control={form.control}
            name="role"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Select 
                    value={field.value} 
                    onChange={field.onChange}
                    options={[
                        { value: "admin", label: "Admin" },
                        { value: "user", label: "User" },
                        { value: "guest", label: "Guest" },
                    ]}
                    placeholder="Select a role"
                  />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />

          {/* Notifications - Switch */}
          <Controller
            control={form.control}
            name="notifications"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Notifications</FormLabel>
                  <FormDescription>
                    Receive emails about new products, features, and more.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={value}
                    onChange={(e: any) => onChange(e.target.checked)}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit">Update profile</Button>
        </form>
      </CardContent>
    </Card>
  );
}
