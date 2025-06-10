<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskList;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Task::with('list')
            ->whereHas('list', function ($query) {
                $query->where('user_id', auth()->id());
            })
            ->orderBy('created_at', 'desc');

        //search filter
        if (request()->has('search')) {
            $search = request('search');
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // completion filter
        if (request()->has('filter') && request('filter') !== 'all') {
            $query->where('is_completed', request('filter') === 'completed');
        }

        $tasks = $query->paginate(9);

        $lists = TaskList::where('user_id', auth()->id())->get();

        return Inertia::render('tasks/index', [
            'tasks' => $tasks,
            'lists' => $lists,
            'filters' => [
                'search' => request('search', ''),
                'filter' => request('filter', 'all'),
            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error')
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'list_id' => 'required|exists:lists,id',
            'is_completed' => 'boolean'
        ]);

        Task::create($validated);

        return redirect()->route('tasks.index')->with('success', 'Task created successfully!');
    }

    /**
     * Display the specified resource.
     */


    /**
     * Show the form for editing the specified resource.
     */


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'is_completed' => 'boolean',
            'list_id' => 'required|exists:lists,id'
        ]);

        $task->update($validated);

        return redirect()->route('tasks.index')->with('success', 'Task updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {
        $task->delete();
        return redirect()->route('tasks.index')->with('success', 'Task deleted successfully!');
    }
}
