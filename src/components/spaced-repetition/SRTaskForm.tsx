
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
import { format, startOfDay } from "date-fns";
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { useSpacedRepetition } from '@/contexts/SpacedRepetitionContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';


const srTaskFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }).max(100, {message: "Title must be less than 100 characters."}),
  content: z.string().max(500, {message: "Content must be less than 500 characters."}).optional(),
  firstReviewDate: z.date({ required_error: "First review date is required."}),
});

type SRTaskFormValues = z.infer<typeof srTaskFormSchema>;

export default function SRTaskForm() {
  const { addTask } = useSpacedRepetition();
  const form = useForm<SRTaskFormValues>({
    resolver: zodResolver(srTaskFormSchema),
    defaultValues: {
      title: '',
      content: '',
      firstReviewDate: startOfDay(new Date()), // Default to today
    },
  });

  const handleSubmit = (data: SRTaskFormValues) => {
    addTask({
        ...data,
        firstReviewDate: format(data.firstReviewDate, 'yyyy-MM-dd'),
    });
    form.reset(); 
  };

  return (
    <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="flex items-center text-xl">
                <PlusCircle size={24} className="mr-2 text-primary" />
                Add New Review Item
            </CardTitle>
            <CardDescription>Schedule something new for spaced repetition.</CardDescription>
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
                        <Input placeholder="e.g., Photosynthesis Process" {...field} />
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
                        <Textarea
                        placeholder="Key points, questions, or concepts to review..."
                        className="resize-none"
                        rows={4}
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="firstReviewDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>First Review Date</FormLabel>
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
                            date < startOfDay(new Date(new Date().setDate(new Date().getDate()))) 
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
                 Add Item to Review Schedule
                </Button>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
