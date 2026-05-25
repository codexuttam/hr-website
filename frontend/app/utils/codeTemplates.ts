// Code template storage for the code playground

export interface CodeTemplate {
  code: string;
  description: string;
}

export const CODE_TEMPLATES: Record<string, CodeTemplate> = {
  javascript: {
    code: `// JavaScript runs in your browser!
console.log('Hello, World!');

// Variables and operations
const name = 'Developer';
const result = 2 + 2;

console.log(\`Welcome, \${name}!\`);
console.log('2 + 2 =', result);`,
    description: 'Basic JavaScript template with variables and console output'
  },
  
  python: {
    code: `# Python 3 - Simple and powerful
print('Hello, World!')

# Variables and operations
name = 'Developer'
result = 2 + 2

print(f'Welcome, {name}!')
print(f'2 + 2 = {result}')`,
    description: 'Basic Python template with variables and print statements'
  },
  
  java: {
    code: `public class Main {
    public static void main(String[] args) {
        // Java - Object-oriented programming
        System.out.println("Hello, World!");
        
        // Variables and operations
        String name = "Developer";
        int result = 2 + 2;
        
        System.out.println("Welcome, " + name + "!");
        System.out.println("2 + 2 = " + result);
    }
}`,
    description: 'Basic Java template with main method and console output'
  },
  
  c_cpp: {
    code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // C++ - Fast and powerful
    cout << "Hello, World!" << endl;
    
    // Variables and operations
    string name = "Developer";
    int result = 2 + 2;
    
    cout << "Welcome, " << name << "!" << endl;
    cout << "2 + 2 = " << result << endl;
    
    return 0;
}`,
    description: 'Basic C++ template with iostream and console output'
  },
  
  typescript: {
    code: `// TypeScript - JavaScript with types
console.log('Hello, World!');

// Variables with type annotations
const userName: string = 'Developer';
const result: number = 2 + 2;

console.log(\`Welcome, \${userName}!\`);
console.log('2 + 2 =', result);`,
    description: 'Basic TypeScript template with type annotations'
  },
  
  ruby: {
    code: `# Ruby - Elegant and expressive
puts 'Hello, World!'

# Variables and operations
name = 'Developer'
result = 2 + 2

puts "Welcome, #{name}!"
puts "2 + 2 = #{result}"`,
    description: 'Basic Ruby template with variables and puts statements'
  },
  
  golang: {
    code: `package main

import "fmt"

func main() {
    // Go - Simple, fast, and reliable
    fmt.Println("Hello, World!")
    
    // Variables and operations
    name := "Developer"
    result := 2 + 2
    
    fmt.Printf("Welcome, %s!\\n", name)
    fmt.Printf("2 + 2 = %d\\n", result)
}`,
    description: 'Basic Go template with fmt package and console output'
  },
  
  c: {
    code: `#include <stdio.h>

int main() {
    // C - The foundation of modern programming
    printf("Hello, World!\\n");
    
    // Variables and operations
    char name[] = "Developer";
    int result = 2 + 2;
    
    printf("Welcome, %s!\\n", name);
    printf("2 + 2 = %d\\n", result);
    
    return 0;
}`,
    description: 'Basic C template with stdio and printf statements'
  },

  csharp: {
    code: `using System;

class Program {
    static void Main() {
        // C# - Modern and versatile
        Console.WriteLine("Hello, World!");
        
        // Variables and operations
        string name = "Developer";
        int result = 2 + 2;
        
        Console.WriteLine($"Welcome, {name}!");
        Console.WriteLine($"2 + 2 = {result}");
    }
}`,
    description: 'Basic C# template with Console output'
  },

  php: {
    code: `<?php
// PHP - Web development language
echo "Hello, World!\\n";

// Variables and operations
$name = "Developer";
$result = 2 + 2;

echo "Welcome, $name!\\n";
echo "2 + 2 = $result\\n";
?>`,
    description: 'Basic PHP template with echo statements'
  },

  swift: {
    code: `// Swift - Modern and safe
print("Hello, World!")

// Variables and operations
let name = "Developer"
let result = 2 + 2

print("Welcome, \\(name)!")
print("2 + 2 = \\(result)")`,
    description: 'Basic Swift template with print statements'
  },

  kotlin: {
    code: `fun main() {
    // Kotlin - Modern JVM language
    println("Hello, World!")
    
    // Variables and operations
    val name = "Developer"
    val result = 2 + 2
    
    println("Welcome, $name!")
    println("2 + 2 = $result")
}`,
    description: 'Basic Kotlin template with println statements'
  },

  rust: {
    code: `fn main() {
    // Rust - Safe and fast
    println!("Hello, World!");
    
    // Variables and operations
    let name = "Developer";
    let result = 2 + 2;
    
    println!("Welcome, {}!", name);
    println!("2 + 2 = {}", result);
}`,
    description: 'Basic Rust template with println! macro'
  },

  scala: {
    code: `object Main extends App {
  // Scala - Functional and object-oriented
  println("Hello, World!")
  
  // Variables and operations
  val name = "Developer"
  val result = 2 + 2
  
  println(s"Welcome, $name!")
  println(s"2 + 2 = $result")
}`,
    description: 'Basic Scala template with println statements'
  },

  perl: {
    code: `#!/usr/bin/perl
# Perl - Practical extraction and reporting
print "Hello, World!\\n";

# Variables and operations
my $name = "Developer";
my $result = 2 + 2;

print "Welcome, $name!\\n";
print "2 + 2 = $result\\n";`,
    description: 'Basic Perl template with print statements'
  },

  r: {
    code: `# R - Statistical computing
print("Hello, World!")

# Variables and operations
name <- "Developer"
result <- 2 + 2

print(paste("Welcome,", name, "!"))
print(paste("2 + 2 =", result))`,
    description: 'Basic R template with print statements'
  },

  haskell: {
    code: `-- Haskell - Pure functional programming
main :: IO ()
main = do
    putStrLn "Hello, World!"
    
    -- Variables and operations
    let name = "Developer"
    let result = 2 + 2
    
    putStrLn ("Welcome, " ++ name ++ "!")
    putStrLn ("2 + 2 = " ++ show result)`,
    description: 'Basic Haskell template with putStrLn'
  },

  lua: {
    code: `-- Lua - Lightweight scripting
print("Hello, World!")

-- Variables and operations
local name = "Developer"
local result = 2 + 2

print("Welcome, " .. name .. "!")
print("2 + 2 = " .. result)`,
    description: 'Basic Lua template with print statements'
  },

  dart: {
    code: `void main() {
  // Dart - Optimized for UI
  print('Hello, World!');
  
  // Variables and operations
  var name = 'Developer';
  var result = 2 + 2;
  
  print('Welcome, $name!');
  print('2 + 2 = $result');
}`,
    description: 'Basic Dart template with print statements'
  },

  elixir: {
    code: `# Elixir - Functional and concurrent
IO.puts "Hello, World!"

# Variables and operations
name = "Developer"
result = 2 + 2

IO.puts "Welcome, #{name}!"
IO.puts "2 + 2 = #{result}"`,
    description: 'Basic Elixir template with IO.puts'
  },

  clojure: {
    code: `; Clojure - Modern Lisp for JVM
(println "Hello, World!")

; Variables and operations
(def name "Developer")
(def result (+ 2 2))

(println (str "Welcome, " name "!"))
(println (str "2 + 2 = " result))`,
    description: 'Basic Clojure template with println'
  },

  fsharp: {
    code: `// F# - Functional-first .NET language
printfn "Hello, World!"

// Variables and operations
let name = "Developer"
let result = 2 + 2

printfn "Welcome, %s!" name
printfn "2 + 2 = %d" result`,
    description: 'Basic F# template with printfn'
  },

  groovy: {
    code: `// Groovy - Dynamic JVM language
println 'Hello, World!'

// Variables and operations
def name = 'Developer'
def result = 2 + 2

println "Welcome, $name!"
println "2 + 2 = $result"`,
    description: 'Basic Groovy template with println'
  },

  objectivec: {
    code: `#import <Foundation/Foundation.h>

int main() {
    @autoreleasepool {
        // Objective-C - Apple's legacy language
        NSLog(@"Hello, World!");
        
        // Variables and operations
        NSString *name = @"Developer";
        int result = 2 + 2;
        
        NSLog(@"Welcome, %@!", name);
        NSLog(@"2 + 2 = %d", result);
    }
    return 0;
}`,
    description: 'Basic Objective-C template with NSLog'
  },

  pascal: {
    code: `program HelloWorld;
begin
  { Pascal - Classic structured programming }
  WriteLn('Hello, World!');
  
  { Variables and operations }
  WriteLn('Welcome, Developer!');
  WriteLn('2 + 2 = ', 2 + 2);
end.`,
    description: 'Basic Pascal template with WriteLn'
  },

  fortran: {
    code: `program hello
  ! Fortran - Scientific computing
  print *, 'Hello, World!'
  
  ! Variables and operations
  character(len=20) :: name
  integer :: result
  
  name = 'Developer'
  result = 2 + 2
  
  print *, 'Welcome, ', trim(name), '!'
  print *, '2 + 2 = ', result
end program hello`,
    description: 'Basic Fortran template with print statements'
  },

  assembly_x86: {
    code: `section .data
    msg db 'Hello, World!', 0xA
    len equ $ - msg

section .text
    global _start

_start:
    ; Write message to stdout
    mov eax, 4
    mov ebx, 1
    mov ecx, msg
    mov edx, len
    int 0x80
    
    ; Exit
    mov eax, 1
    xor ebx, ebx
    int 0x80`,
    description: 'Basic x86 Assembly template with system calls'
  },

  cobol: {
    code: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. HELLO-WORLD.
       
       PROCEDURE DIVISION.
           DISPLAY 'Hello, World!'.
           DISPLAY 'Welcome, Developer!'.
           DISPLAY '2 + 2 = 4'.
           STOP RUN.`,
    description: 'Basic COBOL template with DISPLAY statements'
  },

  lisp: {
    code: `; Common Lisp - Classic AI language
(format t "Hello, World!~%")

; Variables and operations
(defvar name "Developer")
(defvar result (+ 2 2))

(format t "Welcome, ~a!~%" name)
(format t "2 + 2 = ~a~%" result)`,
    description: 'Basic Common Lisp template with format'
  },

  d: {
    code: `import std.stdio;

void main() {
    // D - Modern systems programming
    writeln("Hello, World!");
    
    // Variables and operations
    string name = "Developer";
    int result = 2 + 2;
    
    writeln("Welcome, ", name, "!");
    writeln("2 + 2 = ", result);
}`,
    description: 'Basic D template with writeln'
  },

  erlang: {
    code: `-module(hello).
-export([start/0]).

start() ->
    % Erlang - Concurrent and fault-tolerant
    io:format("Hello, World!~n"),
    
    % Variables and operations
    Name = "Developer",
    Result = 2 + 2,
    
    io:format("Welcome, ~s!~n", [Name]),
    io:format("2 + 2 = ~p~n", [Result]).`,
    description: 'Basic Erlang template with io:format'
  },

  ocaml: {
    code: `(* OCaml - Functional programming *)
print_endline "Hello, World!";;

(* Variables and operations *)
let name = "Developer";;
let result = 2 + 2;;

Printf.printf "Welcome, %s!\\n" name;;
Printf.printf "2 + 2 = %d\\n" result;;`,
    description: 'Basic OCaml template with print_endline'
  },

  prolog: {
    code: `% Prolog - Logic programming
:- initialization(main).

main :-
    write('Hello, World!'), nl,
    write('Welcome, Developer!'), nl,
    write('2 + 2 = 4'), nl,
    halt.`,
    description: 'Basic Prolog template with write statements'
  },

  sql: {
    code: `-- SQL - Database queries
SELECT 'Hello, World!' AS message;

SELECT 'Welcome, Developer!' AS greeting;

SELECT 2 + 2 AS result;`,
    description: 'Basic SQL template with SELECT statements'
  },

  vbscript: {
    code: `' Visual Basic.NET
Imports System

Module Program
    Sub Main()
        ' VB.NET - .NET language
        Console.WriteLine("Hello, World!")
        
        ' Variables and operations
        Dim name As String = "Developer"
        Dim result As Integer = 2 + 2
        
        Console.WriteLine("Welcome, " & name & "!")
        Console.WriteLine("2 + 2 = " & result)
    End Sub
End Module`,
    description: 'Basic VB.NET template with Console.WriteLine'
  }
};

/**
 * Get the code template for a specific language
 * @param language - The language identifier
 * @returns The template code string, or a generic template if language not found
 */
export function getTemplate(language: string): string {
  const template = CODE_TEMPLATES[language];
  if (!template) {
    return `// ${language} template\n// Start coding here...\n`;
  }
  return template.code;
}

/**
 * Get the default template (JavaScript)
 * @returns The JavaScript template code string
 */
export function getDefaultTemplate(): string {
  return CODE_TEMPLATES.javascript.code;
}
