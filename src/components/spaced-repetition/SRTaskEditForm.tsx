
'use client';

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
import { format, parseISO, startOfDay } from "date-fns";
import { CalendarIcon, Save, XCircle } from 'lucide-react';
import { useSpacedRepetition, type SpacedRepetitionTask } from '@/contexts/SpacedRepetitionContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const srTaskEditFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }).max(100, {message: "Title must be less than 100 characters."}),
  content: z.string().max(500, {message: "Content must be less than 500 characters."}).optional(),
  nextReviewDate: z.date({ required_error: "Next review date is required."}), // Keep as 'nextReviewDate' to match SRTask
});

type SRTaskEditFormValues = z.infer<typeof srTaskEditFormSchema>;

interface SRTaskEditFormProps {
  task: SpacedRepetitionTask;
  onCancel: () => void;
}

export default function SRTaskEditForm({ task, onCancel }: SRTaskEditFormProps) {
  const { updateTask } = useSpacedRepetition();
  
  const form = useForm<SRTaskEditFormValues>({
    resolver: zodResolver(srTaskEditFormSchema),
    defaultValues: {
      title: task.title,
      content: task.content || '',
      nextReviewDate: parseISO(task.nextReviewDate),
    },
  });

  const handleSubmit = (data: SRTaskEditFormValues) => {
    updateTask(task.id, {
        ...data,
        nextReviewDate: format(data.nextReviewDate, 'yyyy-MM-dd'), // Ensure date is stringified
    });
    onCancel(); // Close form after submission
  };

  return (
    <Card className="shadow-lg my-4 border-primary">
        <CardHeader>
            <CardTitle className="flex items-center text-xl">
                Edit Review Item: {task.title}
            </CardTitle>
            <CardDescription>Update the details for this spaced repetition item.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Title / Topic</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Notes / Content (Optional)</FormLabel>
                    <FormControl>
                        <Textarea className="resize-none" rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="nextReviewDate" // Changed from firstReviewDate
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Next Review Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}
                            >
                            {field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < startOfDay(new Date(new Date().setDate(new Date().getDate())))} // Allow today
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <div className="flex justify-end space-x-3">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        <XCircle size={18} className="mr-2"/>Cancel
                    </Button>
                    <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Save size={18} className="mr-2"/>Save Changes
                    </Button>
                </div>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
