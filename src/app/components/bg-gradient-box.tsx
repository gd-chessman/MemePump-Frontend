export default function BgGradientBox({ children }: { children: React.ReactNode }) {
    return (
        <div className='dark:p-0 bg-gradient-to-t from-theme-gradient-linear-start to-theme-gradient-linear-end dark:from-theme-blue-100 dark:to-theme-blue-200 relative w-full rounded-xl transition-all duration-300 ease-in-out  hover:shadow-lg'>
            <div className='w-full h-full backdrop-blur-sm p-[1px] rounded-xl'>
                {children}
            </div>
        </div>
    )
}