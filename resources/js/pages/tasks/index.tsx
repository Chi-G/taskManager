import { Head, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, CheckCircle2, XCircle, Calendar, List, CheckCircle, Search, ChevronLeft, ChevronRight, Grid, List as ListIcon, Copy, Image, Bold, Italic, Underline, Strikethrough, List as ListBullet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { ColorPicker } from '@/components/ui/color-picker';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Task {
    id: number;
    title: string;
    description: string | null;
    is_completed: boolean;
    due_date: string | null;
    list_id: number;
    list: {
        id: number;
        title: string;
    };
}

interface List {
    id: number;
    title: string;
}

interface Props {
    tasks: {
        data: Task[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    lists: List[];
    filters: {
        search: string;
        filter: string;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tasks',
        href: '/tasks',
    },
];

export default function TasksIndex({ tasks, lists, filters, flash }: Props) {
    // State management
    const [isOpen, setIsOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [searchTerm, setSearchTerm] = useState(filters.search);
    const [completionFilter, setCompletionFilter] = useState<'all' | 'completed' | 'pending'>(filters.filter as 'all' | 'completed' | 'pending');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [taskStyle, setTaskStyle] = useState({
        backgroundColor: '',
        isBold: false,
        isItalic: false,
        isUnderline: false,
        isStrikethrough: false,
        hasBullets: false
    });

    // Form handling
    const { data, setData, post, put, processing, reset, delete: destroy } = useForm({
        title: '',
        description: '',
        due_date: '',
        list_id: '',
        is_completed: false as boolean,
    });

    // Toast effect
    useEffect(() => {
        if (flash?.success) {
            setToastMessage(flash.success);
            setToastType('success');
            setShowToast(true);
        } else if (flash?.error) {
            setToastMessage(flash.error);
            setToastType('error');
            setShowToast(true);
        }
    }, [flash]);

    // Auto-hide toast
    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    // Event handlers
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (editingTask) {
            put(route('tasks.update', editingTask.id), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    setEditingTask(null);
                },
            });
        } else {
            post(route('tasks.store'), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setData({
            title: task.title,
            description: task.description || '',
            due_date: task.due_date || '',
            list_id: task.list_id.toString(),
            is_completed: task.is_completed,
        });
        setIsOpen(true);
    };

    const handleDelete = (taskId: number) => {
        setDeleteTaskId(taskId);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        if (deleteTaskId) {
            destroy(route('tasks.destroy', deleteTaskId));
            setShowDeleteConfirm(false);
            setDeleteTaskId(null);
        }
    };

    const handleCopy = (task: Task) => {
        const taskText = `${task.title}\n${task.description || ''}\nDue: ${task.due_date || 'No due date'}\nStatus: ${task.is_completed ? 'Completed' : 'Pending'}`;
        navigator.clipboard.writeText(taskText);
        // Show a toast notification
        setToastMessage('Task copied to clipboard');
        setToastType('success');
        setShowToast(true);
    };

    const handleImageUpload = (task: Task, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Handle image upload logic here
            // You'll need to implement the backend API for this
            console.log('Image upload for task:', task.id, file);
        }
    };

    const toggleTextStyle = (style: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'bullets') => {
        setTaskStyle(prev => ({
            ...prev,
            [`is${style.charAt(0).toUpperCase() + style.slice(1)}`]: !prev[`is${style.charAt(0).toUpperCase() + style.slice(1)}` as keyof typeof prev]
        }));
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.get(route('tasks.index'), {
            search: searchTerm,
            filter: completionFilter,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilterChange = (value: 'all' | 'completed' | 'pending') => {
        setCompletionFilter(value);
        router.get(route('tasks.index'), {
            search: searchTerm,
            filter: value,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePageChange = (page: number) => {
        router.get(route('tasks.index'), {
            page,
            search: searchTerm,
            filter: completionFilter,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tasks" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-gradient-to-br from-background to-muted/20">
                {/* Toast Notification */}
                {showToast && (
                    <div
                        className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg p-4 shadow-lg ${
                            toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
                        } text-white animate-in fade-in slide-in-from-top-5`}
                    >
                        {toastType === 'success' ? (
                            <CheckCircle2 className="h-5 w-5" />
                        ) : (
                            <XCircle className="h-5 w-5" />
                        )}
                        <span>{toastMessage}</span>
                    </div>
                )}

                {/* Header Section */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
                        <p className="text-muted-foreground mt-1">Create and Manage your tasks and stay organized</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        >
                            {viewMode === 'grid' ? <ListIcon className="h-4 w-4 mr-2" /> : <Grid className="h-4 w-4 mr-2" />}
                            {viewMode === 'grid' ? 'List View' : 'Grid View'}
                        </Button>
                        <Dialog open={isOpen} onOpenChange={setIsOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Task
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle className="text-xl">
                                        {editingTask ? 'Edit Task' : 'Create New Task'}
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('title', e.target.value)}
                                            required
                                            className="focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                            className="focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="list_id">List</Label>
                                        <Select
                                            value={data.list_id}
                                            onValueChange={(value) => setData('list_id', value)}
                                        >
                                            <SelectTrigger className="focus:ring-2 focus:ring-primary">
                                                <SelectValue placeholder="Select a list" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {lists.map((list) => (
                                                    <SelectItem key={list.id} value={list.id.toString()}>
                                                        {list.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="due_date">Due Date</Label>
                                        <Input
                                            id="due_date"
                                            type="date"
                                            value={data.due_date}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('due_date', e.target.value)}
                                            className="focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="is_completed"
                                            checked={data.is_completed}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('is_completed', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-primary"
                                        />
                                        <Label htmlFor="is_completed">Completed</Label>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg"
                                    >
                                        {editingTask ? 'Update' : 'Create'}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="flex gap-4 mb-4">
                    <form onSubmit={handleSearch} className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </form>
                    <Select
                        value={completionFilter}
                        onValueChange={handleFilterChange}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Tasks</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Tasks Grid/List */}
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-4"}>
                    {tasks.data.map((task) => (
                        <Card
                            key={task.id}
                            className={`hover:bg-accent/50 transition-colors ${viewMode === 'list' ? 'flex-row' : ''}`}
                            style={{ backgroundColor: taskStyle.backgroundColor }}
                        >
                            <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                                <CardTitle className={`text-lg font-medium ${taskStyle.isBold ? 'font-bold' : ''} ${taskStyle.isItalic ? 'italic' : ''} ${taskStyle.isUnderline ? 'underline' : ''} ${taskStyle.isStrikethrough ? 'line-through' : ''}`}>
                                    {taskStyle.hasBullets ? '• ' : ''}{task.title}
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(task)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleCopy(task)}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSelectedTask(task)}
                                    >
                                        <Image className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(task.id)}
                                        className="text-destructive hover:text-destructive/90"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className={viewMode === 'list' ? 'flex-1' : ''}>
                                <p className={`text-sm text-muted-foreground ${taskStyle.isBold ? 'font-bold' : ''} ${taskStyle.isItalic ? 'italic' : ''} ${taskStyle.isUnderline ? 'underline' : ''} ${taskStyle.isStrikethrough ? 'line-through' : ''}`}>
                                    {task.description || 'No description'}
                                </p>
                                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                    <List className="h-4 w-4" />
                                    <span>{task.list.title}</span>
                                </div>
                                {task.due_date && (
                                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(task.due_date).toLocaleDateString()}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                    {task.is_completed ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-500" />
                                    )}
                                    <span className="text-sm text-muted-foreground">
                                        {task.is_completed ? 'Completed' : 'Pending'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Delete Confirmation Dialog */}
                <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Delete</DialogTitle>
                        </DialogHeader>
                        <p>Are you sure you want to delete this task? This action cannot be undone.</p>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button variant="destructive" onClick={confirmDelete}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Image Upload Dialog */}
                <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Upload Image</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => selectedTask && handleImageUpload(selectedTask, e)}
                            />
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Text Formatting Toolbar */}
                <div className="fixed bottom-4 right-4 flex gap-2 bg-background p-2 rounded-lg shadow-lg">
                    <Toggle pressed={taskStyle.isBold} onPressedChange={() => toggleTextStyle('bold')}>
                        <Bold className="h-4 w-4" />
                    </Toggle>
                    <Toggle pressed={taskStyle.isItalic} onPressedChange={() => toggleTextStyle('italic')}>
                        <Italic className="h-4 w-4" />
                    </Toggle>
                    <Toggle pressed={taskStyle.isUnderline} onPressedChange={() => toggleTextStyle('underline')}>
                        <Underline className="h-4 w-4" />
                    </Toggle>
                    <Toggle pressed={taskStyle.isStrikethrough} onPressedChange={() => toggleTextStyle('strikethrough')}>
                        <Strikethrough className="h-4 w-4" />
                    </Toggle>
                    <Toggle pressed={taskStyle.hasBullets} onPressedChange={() => toggleTextStyle('bullets')}>
                        <ListBullet className="h-4 w-4" />
                    </Toggle>
                    <ColorPicker
                        value={taskStyle.backgroundColor}
                        onChange={(color) => setTaskStyle(prev => ({ ...prev, backgroundColor: color }))}
                    />
                </div>

                {/* Pagination */}
                {tasks.last_page > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(tasks.current_page - 1)}
                            disabled={tasks.current_page === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {tasks.current_page} of {tasks.last_page}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(tasks.current_page + 1)}
                            disabled={tasks.current_page === tasks.last_page}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}


