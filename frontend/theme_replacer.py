import os
import re
import glob

def apply_monochrome_glassmorphism():
    base_dir = 'app'
    
    # 1. Update Globals.css for stark black and white
    globals_path = os.path.join(base_dir, 'globals.css')
    if os.path.exists(globals_path):
        with open(globals_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # We will add an animation for the mesh background
        if 'mesh-blob' not in content:
            content += """
/* Mesh Glassmorphism Animations */
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}
"""
        with open(globals_path, 'w', encoding='utf-8') as f:
            f.write(content)

    # 2. Update page.tsx to include the animated glassmorphism background
    page_path = os.path.join(base_dir, 'page.tsx')
    if os.path.exists(page_path):
        with open(page_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Replace the main div wrapper
        content = re.sub(
            r'<div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-gray-100 font-sans">',
            r'''<div className="relative min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans overflow-hidden">
      {/* Animated Glassmorphism Background blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-200 dark:bg-zinc-800 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-neutral-300 dark:bg-neutral-800 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-gray-300 dark:bg-gray-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      <div className="relative z-10">''',
            content
        )
        content = content.replace('      <Footer />\n    </div>', '      </div>\n      <Footer />\n    </div>')
        with open(page_path, 'w', encoding='utf-8') as f:
            f.write(content)

    # 3. Process all component files
    tsx_files = glob.glob(os.path.join(base_dir, 'components', '*.tsx'))
    
    color_replacements = {
        # Indigo
        'indigo-50/50': 'gray-100/50', 'indigo-900/30': 'zinc-900/30',
        'indigo-50': 'gray-100', 'indigo-100': 'gray-200', 'indigo-200': 'gray-300', 
        'indigo-300': 'gray-400', 'indigo-400': 'gray-500', 'indigo-500': 'black dark:white', 
        'indigo-600': 'black dark:text-white', 'indigo-700': 'zinc-900', 'indigo-800': 'zinc-800', 'indigo-900': 'zinc-900',
        # Purple
        'purple-50': 'gray-100', 'purple-100': 'gray-200', 'purple-200': 'gray-300', 
        'purple-400': 'gray-500', 'purple-500': 'neutral-800', 'purple-600': 'neutral-900',
        # Pink / Rose / Emerald / Amber
        'pink-500': 'zinc-800', 'pink-400': 'zinc-500',
        'rose-500': 'black', 'rose-400': 'gray-500', 'rose-600': 'black',
        'emerald-500': 'black', 'emerald-400': 'gray-500',
        'amber-500': 'black', 'amber-400': 'gray-500',
        'blue-500': 'black', 'blue-400': 'gray-500',
        'teal-500': 'black', 'teal-400': 'gray-500',
        'orange-500': 'black', 'orange-400': 'gray-500',
        'fuchsia-600': 'black', 'fuchsia-500': 'gray-700',
        'cyan-500': 'black', 'cyan-400': 'gray-500',
        'violet-600': 'black',
        # Complex replacements for Gradients
        'from-indigo-600 to-purple-600': 'from-black to-gray-700 dark:from-white dark:to-gray-400',
        'from-indigo-600 via-purple-600 to-pink-500': 'from-black via-gray-700 to-gray-500 dark:from-white dark:via-gray-300 dark:to-gray-500',
        'bg-indigo-600': 'bg-black dark:bg-white dark:text-black',
        'text-indigo-600': 'text-black dark:text-white',
        'hover:text-indigo-600': 'hover:text-black dark:hover:text-white',
        'bg-indigo-50/50': 'bg-black/5 dark:bg-white/5',
        'dark:bg-indigo-900/20': 'dark:bg-white/10',
        'dark:bg-indigo-900/30': 'dark:bg-white/10',
        'dark:bg-indigo-900/40': 'dark:bg-white/15',
        'bg-indigo-50': 'bg-gray-100',
        'border-indigo-500': 'border-black dark:border-white',
        
        # Slate backgrounds to glassmorphism
        'bg-slate-900': 'bg-black/80 backdrop-blur-xl',
        'bg-white dark:bg-slate-900': 'bg-white/80 dark:bg-black/80 backdrop-blur-xl',
        'bg-white/40 dark:bg-slate-900/40': 'bg-white/30 dark:bg-black/30',
        'bg-white/60 dark:bg-slate-800/60': 'bg-white/40 dark:bg-black/40',
        'border-slate-200/50 dark:border-slate-700/50': 'border-black/10 dark:border-white/10',
        'border-slate-200/60 dark:border-slate-700/60': 'border-black/10 dark:border-white/10',
        'bg-slate-50 dark:bg-slate-900/50': 'bg-transparent',
        'bg-white/70 dark:bg-slate-950/70': 'bg-white/30 dark:bg-black/30 backdrop-blur-2xl border-b border-black/5 dark:border-white/5',
        
        # Text replacements
        'text-slate-900 dark:text-white': 'text-black dark:text-white',
        'text-gray-600 dark:text-gray-300': 'text-gray-700 dark:text-gray-300',
        'text-gray-600 dark:text-gray-400': 'text-gray-700 dark:text-gray-400',
        'text-transparent bg-clip-text bg-gradient-to-r': 'text-transparent bg-clip-text bg-gradient-to-r',
    }

    for file_path in tsx_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        for old, new in color_replacements.items():
            content = content.replace(old, new)
            
        # Regex replacements for generic tailwind classes
        # text-indigo-something -> text-black dark:text-white
        content = re.sub(r'text-(indigo|purple|pink|rose|emerald|amber|blue|teal|orange|fuchsia|cyan)-[456]00', 'text-black dark:text-white', content)
        content = re.sub(r'bg-(indigo|purple|pink|rose|emerald|amber|blue|teal|orange|fuchsia|cyan)-[456]00', 'bg-black dark:bg-white', content)
        content = re.sub(r'from-(indigo|purple|pink|rose|emerald|amber|blue|teal|orange|fuchsia|cyan)-[456]00', 'from-black dark:from-white', content)
        content = re.sub(r'to-(indigo|purple|pink|rose|emerald|amber|blue|teal|orange|fuchsia|cyan)-[456]00', 'to-gray-700 dark:to-gray-300', content)
        content = re.sub(r'shadow-(indigo|purple|pink|rose|emerald|amber|blue|teal|orange|fuchsia|cyan)-500\/[0-9]+', 'shadow-black/10 dark:shadow-white/10', content)
        content = re.sub(r'ring-(indigo|purple|pink|rose|emerald|amber|blue|teal|orange|fuchsia|cyan)-[456]00', 'ring-black/20 dark:ring-white/20', content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
    print("Done applying glassmorphism theme.")

if __name__ == '__main__':
    apply_monochrome_glassmorphism()
