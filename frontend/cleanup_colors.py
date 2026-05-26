import os
import re
import glob

def clean_up_colors():
    base_dir = 'app'
    tsx_files = glob.glob(os.path.join(base_dir, 'components', '*.tsx'))
    
    replacements = {
        'from-[#ff80b5] to-[#9089fc]': 'from-gray-200 to-gray-400 dark:from-zinc-800 dark:to-zinc-600',
        'from-pink-500 to-rose-500': 'from-gray-300 to-gray-500 dark:from-zinc-700 dark:to-zinc-500',
        'from-indigo-500 to-purple-600': 'from-gray-400 to-gray-600 dark:from-zinc-600 dark:to-zinc-800',
        'from-indigo-500/5 to-purple-500/5': 'from-black/5 to-black/5 dark:from-white/5 dark:to-white/5',
        'from-indigo-400 via-purple-400 to-pink-400': 'from-gray-700 via-gray-900 to-black dark:from-gray-300 dark:via-white dark:to-gray-100',
        'bg-purple-900/30': 'bg-black/10 dark:bg-white/10',
        'bg-pink-100/50': 'bg-black/5 dark:bg-white/5',
        'bg-pink-900/30': 'bg-black/10 dark:bg-white/10',
        'border-purple-700/50': 'border-black/10 dark:border-white/10',
        'border-pink-200/50': 'border-black/10 dark:border-white/10',
        'border-pink-700/50': 'border-black/10 dark:border-white/10',
        'from-[#ff80b5]': 'from-gray-300 dark:from-zinc-700',
        'to-[#9089fc]': 'to-gray-500 dark:to-zinc-500',
        'text-rose-600': 'text-black dark:text-white',
        'text-rose-400': 'text-black dark:text-white',
        'ring-rose-600/20': 'ring-black/20 dark:ring-white/20',
        'ring-rose-400/30': 'ring-black/30 dark:ring-white/30',
        'bg-rose-50/50': 'bg-black/5 dark:bg-white/5',
        'bg-rose-900/30': 'bg-black/10 dark:bg-white/10',
        'bg-rose-500': 'bg-black dark:bg-white',
        'bg-rose-400': 'bg-black dark:bg-white',
        'text-indigo-200': 'text-gray-500 dark:text-gray-400',
    }

    for file_path in tsx_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        for old, new in replacements.items():
            content = content.replace(old, new)
            
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

    print("Cleanup done.")

if __name__ == '__main__':
    clean_up_colors()
