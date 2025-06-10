export default function AppLogo() {
    const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <img src="/logo.png" alt={`${appName} Logo`} className="size-20 object-contain" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">{appName}</span>
            </div>
        </>
    );
}
