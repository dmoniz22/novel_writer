'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateChapterText } from '@/ai/flows/generate-chapter-text';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Feather, BookOpen, Map, Swords, Sparkles, User, FileText, Bot, Upload, PenTool, Book } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  seriesOutline: z.string().min(50, 'Series outline must be at least 50 characters.'),
  worldbuildingInformation: z.string().min(50, 'Worldbuilding information must be at least 50 characters.'),
  bookOutline: z.string().min(50, 'Book outline must be at least 50 characters.'),
  chapterOutline: z.string().min(50, 'Chapter outline must be at least 50 characters.'),
  chapterLength: z.string().optional(),
  writingStyle: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type FormKeys = keyof Pick<FormValues, 'seriesOutline' | 'worldbuildingInformation' | 'bookOutline' | 'chapterOutline'>;

export default function SagaForgePage() {
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const fileInputRefs: { [key in FormKeys]?: React.RefObject<HTMLInputElement> } = {
    seriesOutline: useRef<HTMLInputElement>(null),
    worldbuildingInformation: useRef<HTMLInputElement>(null),
    bookOutline: useRef<HTMLInputElement>(null),
    chapterOutline: useRef<HTMLInputElement>(null),
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      seriesOutline: '',
      worldbuildingInformation: '',
      bookOutline: '',
      chapterOutline: '',
      chapterLength: '',
      writingStyle: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: FormKeys) => {
    const files = e.target.files;
    if (!files) return;

    let combinedText = form.getValues(field) || '';

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target?.result as string;
        if (combinedText.length > 0) {
          combinedText += '\n\n---\n\n';
        }
        combinedText += `[${file.name}]\n${fileContent}`;
        form.setValue(field, combinedText, { shouldValidate: true });
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        toast({
          variant: "destructive",
          title: "File Read Error",
          description: `Could not read the file ${file.name}.`,
        });
      };
      reader.readAsText(file);
    });
  };

  const createUploadTrigger = (field: FormKeys) => {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRefs[field]?.current?.click()}
      >
        <Upload className="mr-2 h-4 w-4" />
        Upload File(s)
      </Button>
    );
  };
  

  async function onSubmit(values: FormValues) {
    setIsGenerating(true);
    setGeneratedText('');
    try {
      const result = await generateChapterText(values);
      setGeneratedText(result.chapterText);
      toast({
        title: "Chapter Generated!",
        description: "Your new chapter has been forged by the AI.",
      });
    } catch (error) {
      console.error('Error generating chapter:', error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "The AI failed to forge your chapter. Please check your outlines and try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  const handleApprove = () => {
    toast({
      title: 'Chapter Approved!',
      description: 'This chapter has been saved to your library (mocked).',
    });
  };

  const handleRequestChanges = () => {
    setGeneratedText('');
    toast({
      title: 'Requesting Changes',
      description: 'The generated text has been cleared. Modify your outlines and generate again.',
    });
    // Optional: scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderFormField = (name: FormKeys, label: string, placeholder: string, icon?: React.ReactNode) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex justify-between items-center">
            <FormLabel className="font-bold flex items-center gap-2">{icon}{label}</FormLabel>
            {createUploadTrigger(name)}
          </div>
          <FormControl>
            <div>
              <input
                type="file"
                ref={fileInputRefs[name]}
                multiple
                onChange={(e) => handleFileChange(e, name)}
                className="hidden"
                accept=".txt,.md,.rtf"
              />
              <Textarea
                placeholder={placeholder}
                className="min-h-[150px] bg-background/50"
                {...field}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-2 items-center">
            <Feather className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-headline font-bold text-primary">SagaForge</h1>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="fantasy character" />
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>My Library</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container py-8">
        <div className="text-center mb-12">
          <h2 className="font-headline text-4xl font-bold tracking-tight">Welcome, Story-Weaver</h2>
          <p className="text-lg text-muted-foreground mt-2">Provide the AI with your lore, and watch as it forges your next chapter.</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-8">
                <Card className="shadow-lg hover:shadow-primary/20 transition-shadow">
                  <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2 text-2xl"><Swords className="text-accent" /> Knowledge Base</CardTitle>
                    <CardDescription>Input your foundational lore. The more detailed, the better the results.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {renderFormField("seriesOutline", "Series Outline", "Paste your grand series outline here...")}
                    {renderFormField("worldbuildingInformation", "Worldbuilding & Lore", "Describe your world: its magic system, key locations, cultures, history...", <Map size={16} />)}
                  </CardContent>
                </Card>

                <Card className="shadow-lg hover:shadow-primary/20 transition-shadow">
                  <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2 text-2xl"><BookOpen className="text-accent"/> Current Manuscript</CardTitle>
                    <CardDescription>Detail the current book and the chapter you want to generate.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                     {renderFormField("bookOutline", "Book Outline", "Outline the plot for the current book...")}
                     {renderFormField("chapterOutline", "Chapter Outline", "Provide a detailed outline for this specific chapter. What happens? Who is present? What is the tone?", <FileText size={16} />)}
                     <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="chapterLength"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="font-bold flex items-center gap-2"><Book size={16} />Est. Chapter Length</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., 3000 words or 10 pages" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="writingStyle"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="font-bold flex items-center gap-2"><PenTool size={16}/>Writing Style</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., J.R.R. Tolkien, Brandon Sanderson" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                     </div>
                  </CardContent>
                </Card>
                 <Button type="submit" size="lg" className="w-full font-bold text-lg" disabled={isGenerating}>
                  <Sparkles className="mr-2 h-5 w-5" />
                  {isGenerating ? 'Forging your chapter...' : 'Forge Chapter'}
                </Button>
              </div>

              <div className="lg:col-span-2">
                <Card className="shadow-lg h-full sticky top-24">
                  <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2 text-2xl"><Bot className="text-accent" /> Generated Chapter</CardTitle>
                    <CardDescription>Your AI-generated text will appear here for review.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-10rem)] flex flex-col">
                    <ScrollArea className="flex-1 pr-4 -mr-4 mb-4">
                      {isGenerating ? (
                        <div className="space-y-4">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-[90%]" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-[80%]" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-[95%]" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ) : generatedText ? (
                        <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap font-body leading-relaxed">
                          {generatedText}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                          <p>Your chapter awaits its creation.</p>
                        </div>
                      )}
                    </ScrollArea>
                    {generatedText && !isGenerating && (
                      <>
                        <Separator className="my-4"/>
                        <div className="flex flex-col sm:flex-row gap-2 justify-end">
                           <Button variant="outline" onClick={handleRequestChanges}>Request Changes</Button>
                           <Button onClick={handleApprove}>Approve & Save</Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
