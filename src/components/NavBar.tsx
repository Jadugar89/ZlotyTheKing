import React from 'react';

function NavBar() {
    return (
                <div className='flex  items-center justify-end backdrop-blur-sm bg-white/75 dark:bg-slate-900/75 z-50 top-0 left-0 right-0 h-20 border-b border-slate-300 dark:border-slate-700 shadow-sm'>
                 <h3 className='mx-8 font-bold text-xl'>Currency Calculator</h3>
                </div>
    );
}

export default NavBar;