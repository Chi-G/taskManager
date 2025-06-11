import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Grid, List as ListIcon, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface List {
    id: number;
    title: string;
    description: string | null;
    tasks_count?: number;
    theme?: string;
}

interface Props {
    lists: {
        data: List[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Lists',
        href: '/lists',
    },
];

const themeColors = [
    { name: 'Default', value: 'bg-background dark:bg-background' },
    { name: 'Blue', value: 'bg-blue-50 dark:bg-blue-950' },
    { name: 'Green', value: 'bg-green-50 dark:bg-green-950' },
    { name: 'Yellow', value: 'bg-yellow-50 dark:bg-yellow-950' },
    { name: 'Red', value: 'bg-red-50 dark:bg-red-950' },
    { name: 'Purple', value: 'bg-purple-50 dark:bg-purple-950' },
];

export default function ListsIndex({ lists, flash }: Props) {
    // State management
    const [isOpen, setIsOpen] = useState(false);
    const [editingList, setEditingList] = useState<List | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [isGridView, setIsGridView] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [listToDelete, setListToDelete] = useState<List | null>(null);
    const [selectedTheme, setSelectedTheme] = useState<string>('bg-background');

    // Form handling
    const { data, setData, post, put, processing, reset, delete: destroy } = useForm({
        title: '',
        description: '',
        theme: 'bg-background',
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
        if (editingList) {
            put(route('lists.update', editingList.id), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    setEditingList(null);
                },
            });
        } else {
            post(route('lists.store'), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (list: List) => {
        setEditingList(list);
        setSelectedTheme(list.theme || 'bg-background dark:bg-background');
        setData({
            title: list.title,
            description: list.description || '',
            theme: list.theme || 'bg-background dark:bg-background',
        });
        setIsOpen(true);
    };

    const handleDelete = (list: List) => {
        setListToDelete(list);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!listToDelete) return;
        destroy(route('lists.destroy', listToDelete.id), {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setListToDelete(null);
            },
        });
    };

    const handleCopy = (list: List) => {
        const text = `${list.title}\n${list.description || ''}`;
        navigator.clipboard.writeText(text);
        setToastMessage('List copied to clipboard');
        setToastType('success');
        setShowToast(true);
    };

    const handleThemeChange = (theme: string, e: React.MouseEvent) => {
        e.preventDefault();
        setSelectedTheme(theme);
        if (editingList) {
            setData('theme', theme);
        }
    };

    const handlePageChange = (page: number) => {
        router.get(route('lists.index'), {
            page,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lists" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
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
                        <h1 className="text-2xl font-bold tracking-tight">Lists</h1>
                        <p className="text-muted-foreground mt-1">Create and Manage your Lists and stay organized</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Button
                                variant={isGridView ? "default" : "outline"}
                                size="icon"
                                onClick={() => setIsGridView(true)}
                            >
                                <Grid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={!isGridView ? "default" : "outline"}
                                size="icon"
                                onClick={() => setIsGridView(false)}
                            >
                                <ListIcon className="h-4 w-4" />
                            </Button>
                        </div>
                        <Dialog open={isOpen} onOpenChange={setIsOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    New List
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingList ? 'Edit List' : 'Create New List'}
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
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Theme</Label>
                                        <div className="flex gap-2">
                                            {themeColors.map((theme) => (
                                                <Button
                                                    key={theme.value}
                                                    type="button"
                                                    variant={selectedTheme === theme.value ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={(e) => handleThemeChange(theme.value, e)}
                                                    className={theme.value}
                                                >
                                                    {theme.name}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {editingList ? 'Update' : 'Create'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Lists Grid/List */}
                {isGridView ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lists.data.map((list) => (
                            <Card key={list.id} className={`hover:bg-accent/50 transition-colors ${list.theme || 'bg-background dark:bg-background'}`}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-lg font-medium">
                                        {list.title}
                                    </CardTitle>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(list)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleCopy(list)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(list)}
                                            className="text-destructive hover:text-destructive/90"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {list.description || 'No description'}
                                    </p>
                                    {list.tasks_count !== undefined && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            {list.tasks_count} Tasks
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {lists.data.map((list) => (
                            <Card key={list.id} className={`hover:bg-accent/50 transition-colors ${list.theme || 'bg-background dark:bg-background'}`}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-lg font-medium">
                                        {list.title}
                                    </CardTitle>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(list)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleCopy(list)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(list)}
                                            className="text-destructive hover:text-destructive/90"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {list.description || 'No description'}
                                    </p>
                                    {list.tasks_count !== undefined && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            {list.tasks_count} Tasks
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {lists.last_page > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(lists.current_page - 1)}
                            disabled={lists.current_page === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {lists.current_page} of {lists.last_page}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(lists.current_page + 1)}
                            disabled={lists.current_page === lists.last_page}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete List</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this list? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}