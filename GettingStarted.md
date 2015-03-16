# Introducion in Testboy #

## What is Testboy for ##

Testboy is a framework that was intended to help developers that write a lot of JavaScript code
to automate regression testing. If you have an issue in your JavaScript program, you fix it and
write a unit test with Testboy for this case. Next time when you change your code, you simply start
your Testboy test to check whether your issue is still fixed. If something goes wrong, Testboy will
inform you through its console.

## Testboy and Other JavaScript Libraries ##

Testboy is a standalone project, so it doesn't require any other JavaScript library to be included
to work properly. Although there won't be any compatibility issue, in case you use it along with another
JavaScript library. Testboy has its own `testboy` namespace and doesn't use so popular shortcut `$`
in order to avoid naming collisions with jQuery or Prototype.

## Extending Testboy ##

Testboy has its own standard API - everything you need to write tests. Sometimes a developer may want
to extend standard objects or constructors to inject his own functionality, e.g. redefine console
output.

Testboy API is fully object-oriented, and comprised from a set of objects and constructors that
can be easily extended with standard `Object.create()` JavaScript method. It doesn't
implement and doesn't require any `.extend()` function which is often a library depended. Testboy
API is written in raw low-level JavaScript, and you don't have to learn new syntax or some Testboy
specific features to work with it if you're familiar with OO JavaScript.
for detailed information.

## What Testboy Is Not ##

Testboy is a unit testing framework for client-side JavaScript. Its goal is to automate JavaScript
code testing. This is not a UI testing tool, so there's no functionality that allows to test e.g.
CSS display or HTML structure. There are other special tools intended for that purpose.

## Testboy and xUnit ##

Testboy implements popular xUnit architecture, so if you're familiar with this you'll be
like fish in water.

Good luck!












