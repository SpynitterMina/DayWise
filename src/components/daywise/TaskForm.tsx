
'use client';

import type { ComponentProps } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle } from 'lucide-react';

const taskFormSchema = z.object({
  description: z.string().min(3, { message: 'Description must be at least 3 characters.' }).max(200, {message: "Description must be less than 200 characters."}),
  estimatedTime: z.coerce
    .number()
    .min(1, { message: 'Estimated time must be at least 1 minute.' })
    .max(1440, { message: 'Estimated time cannot exceed 24 hours (1440 minutes).'}),
  category: z.string().optional().describe("Optional category for the task, e.g., Work, Study, Personal."),
  scheduledDate: z.date().optional().describe("Optional date to schedule the task for."),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

// Modify TaskFormValues to include category and scheduledDate (string version for submission)
interface TaskFormSubmitValues extends Omit<TaskFormValues, 'scheduledDate'> {
  scheduledDate?: string; // Date will be stringified
}


interface TaskFormProps {
  onSubmit: (data: TaskFormSubmitValues) => void;
  className?: ComponentProps<'form'>['className'];
}

export default function TaskForm({ onSubmit, className }: TaskFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      description: '',
      estimatedTime: 30,
      category: '',
      scheduledDate: undefined,
    },
  });

  const handleSubmit = (data: TaskFormValues) => {
    const submitData: TaskFormSubmitValues = {
        ...data,
        scheduledDate: data.scheduledDate ? format(data.scheduledDate, 'yyyy-MM-dd') : undefined,
    };
    onSubmit(submitData);
    form.reset(); 
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={`space-y-6 ${className}`}>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Finish report for Q3"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="estimatedTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Time (minutes)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 60" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category (Optional)</FormLabel>
              <FormControl>
                <Input type="text" placeholder="e.g., Work, Study" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scheduledDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Scheduled Date (Optional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date(new Date().setDate(new Date().getDate() -1)) // Disable past dates, allow today
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle size={20} className="mr-2" />
          Add Task
        </Button>
      </form>
    </Form>
  );
}
