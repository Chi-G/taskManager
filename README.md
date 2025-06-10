# Task Manager

A modern, feature-rich task management application built with Laravel, React, and TypeScript. This application helps users organize their tasks efficiently with a beautiful and intuitive user interface.

![Task Manager Screenshot White](screenshot-white.png)
![Task Manager Screenshot Dark](screenshot-dark.png)

## Features

- 📋 **Task Management**
  - Create, edit, and delete tasks
  - Set due dates and completion status
  - Add detailed descriptions
  - Organize tasks into lists

- 📑 **List Organization**
  - Create custom lists for task categorization
  - View tasks by list
  - Track task counts per list

- 🔍 **Advanced Filtering**
  - Search tasks by title or description
  - Filter tasks by completion status
  - Sort tasks by creation date

- 📱 **Responsive Design**
  - Beautiful UI that works on all devices
  - Modern and intuitive interface
  - Smooth animations and transitions

- 🔐 **User Authentication**
  - Secure login and registration
  - Protected routes and resources
  - User-specific data isolation

## Tech Stack

- **Backend**: Laravel 12.17
- **Frontend**: React with TypeScript
- **UI Framework**: Tailwind CSS
- **Database**: MySQL
- **Authentication**: Laravel Breeze
- **State Management**: Inertia.js

## Prerequisites

Before you begin, ensure you have the following installed:
- PHP 8.4 or higher
- Composer
- Node.js 16.x or higher
- MySQL 5.7 or higher
- WAMP/XAMPP (for Windows) or similar local development environment

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/task-manager.git
   cd task-manager
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install JavaScript dependencies**
   ```bash
   npm install
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Configure your database**
   - Open `.env` file
   - Update the following variables:
     ```
     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_DATABASE=task_manager
     DB_USERNAME=your_username
     DB_PASSWORD=your_password
     ```

6. **Run database migrations**
   ```bash
   php artisan migrate
   ```

7. **Build assets**
   ```bash
   npm run build
   ```

8. **Start the development server**
   ```bash
   php artisan serve
   ```

9. **In a separate terminal, start Vite**
   ```bash
   npm run dev
   ```

## Usage

1. Visit `http://localhost:8000` in your browser
2. Register a new account or login if you already have one
3. Start creating lists and tasks to organize your work

## Development

- **Running tests**
  ```bash
  php artisan test
  ```

- **Code style check**
  ```bash
  composer run lint
  ```

- **TypeScript compilation**
  ```bash
  npm run type-check
  ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

If you encounter any issues or have questions, please:
1. Check the [documentation](docs/)
2. Search for existing issues
3. Create a new issue if needed

## Acknowledgments

- [Laravel](https://laravel.com)
- [React](https://reactjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Inertia.js](https://inertiajs.com) 