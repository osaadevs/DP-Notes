# INTE 22313 — Design Patterns & Frameworks: Study Digest

Written from the downloaded module files in `Module Files/` (lecture slides OCR'd, past papers 2022–2025, 7 in-class quizzes, the existing 11 print notes, peer notes, recommended references). Exam: **Wed 04 Nov 2026, open book, 2.5 h, 4 × 25 marks, answer all.** Final exam = 50% of the module.

---

## 1. What the exam actually looks like

Every paper since 2022 has the same shape:

| Q | Shape | Notes |
|---|---|---|
| Q1 | Scenario → name pattern(s) + reasons → write a Java interface/class | 2024–25: "Define interface X with `getCost()`/`getDescription()`", "Create concrete class Y" |
| Q2 | **Microservices case study** (2023, 2024, 2025 — every year) | Same 5 sub-questions each year: diagram · scalability / fault isolation / CD · propose architecture · data consistency · security |
| Q3 | Scenario → pattern(s) → class diagram / code | 2025: four patterns in one question |
| Q4 | Several short scenarios **or** a multi-pattern scenario | "Identify the pattern for (a)(b)(c)(d) with reasons" |

**Trend:** 2022–23 asked one pattern per question with "challenges → mechanism to overcome". 2024–25 moved to **several patterns in one scenario + short Java code**. Expect 2026 to follow 2025.

Recurring sub-questions worth pre-writing answers for:
- "What challenges will you face… / mechanism to overcome" (2022, 2023)
- "How would you extend this for High Availability & Disaster Recovery" (2022 Q3.5, 2023 Q3.5)
- "Explain the use of interfaces / abstract classes" (2024 Q3.4, Q4.4)
- "How would you improve configurability" (2023 Q1.5)
- "Draw a diagram to depict the scenario" (almost every question, 4–5 marks)

## 2. How often each pattern was examined

Counted across 4 past papers + 7 quizzes.

| Pattern | Times | Typical trigger in the question |
|---|---|---|
| **Singleton** (+ Multiton) | 9 | "only one", "single global tax calculator / OrderID / logger", "run by only one user", "max 5 batsmen" (Multiton) |
| **Decorator** | 7 | "optional add-ons… without subclasses for every combination", coffee/cake/kiosk/profile |
| **Chain of Responsibility** | 6 | "sequence of checks, in order, easy to extend", support levels, spam sub-filters, exception priorities |
| **Factory Method** | 6 | "create different types of X depending on user request", accounts, DBs, books, payments, LMS modules |
| **Template Method** | 5 | "same overall process / common workflow, however step X differs", salary, checkout, payment, course completion |
| **Proxy** | 5 | "load only a couple of pages", "restricted… access through permissions", "authorization options" |
| **State** | 3 | "operates in states", "transitions to", "draw the state diagram" |
| **Adapter** | 4 | "third-party / vendor / can't modify / different method signatures" |
| **Facade** | 2 | "one simple interface by internally calling A, B, C", combine air+hotel+taxi |
| **Microservices** | 3 of 4 papers | always Q2, always the same 5 questions on a new domain |

## 3. The module in one page (what I learned)

**Theory (Lecture 1)** — A design pattern = a proven, reusable solution to a recurring design problem; 4 elements: *problem, context, solution structure, consequences*. Origin: Christopher Alexander (building architecture) → GoF book, 1995 (Gamma, Helm, Johnson, Vlissides), 23 patterns. Three categories: **Creational** (how objects are created — Singleton, Factory Method, Abstract Factory, Builder, Prototype), **Structural** (how classes/objects are composed — Adapter, Decorator, Facade, Proxy, Composite, Bridge, Flyweight), **Behavioral** (how objects interact — Template Method, CoR, State, Strategy, Observer, Command, Iterator). Patterns are *not* copy-paste code, not rules, not guaranteed; misuse = over-engineering. **Anti-pattern** = a common but poor solution: looks good short-term, hurts long-term (causes: time pressure, poor planning, overconfidence, tech-for-show, no design thinking).

**The 9 taught patterns**

| Pattern | Cat. | One-liner | Participants to name |
|---|---|---|---|
| Singleton | C | one instance + global access | private ctor, private static instance, public static `getInstance()`; thread-safety via double-checked locking + `volatile` |
| Factory Method | C | let a factory/subclass decide which class to instantiate | Product «i», ConcreteProducts, Creator / Factory `create(type)` |
| Facade | S | one simple entry over many subsystems | Facade, Subsystems, Client (facade only delegates) |
| Adapter | S | convert an incompatible interface | Client, Target «i», Adapter, Adaptee |
| Proxy | S | same interface, *controls access* (virtual / protection / remote / cache / logging) | Subject «i», RealSubject, Proxy |
| Decorator | S | same interface, *adds features* by stacking wrappers | Component «i», ConcreteComponent, abstract Decorator (is-a + has-a), ConcreteDecorators |
| Template Method | B | fixed algorithm skeleton in a `final` method; subclasses fill steps | AbstractClass, ConcreteClasses, hooks |
| Chain of Resp. | B | pass a request along handlers until handled (or all checks pass) | Handler (`next`), ConcreteHandlers, Request, Client; add a fallback handler |
| State | B | behaviour changes with internal state; states trigger transitions | Context (`setState`), State «i», ConcreteStates |

**Easy-to-confuse pairs** — Adapter (changes interface) vs Proxy (same interface, controls) vs Decorator (same interface, adds, stackable); Facade (simplifies many) vs Adapter (converts one); State ("how do I behave now?") vs CoR ("who handles this?"); Factory (which type) vs Singleton (how many); Template (inheritance, vary steps) vs Strategy (composition, swap whole algorithm).

**SOLID (Lecture 12)** — SRP, OCP, LSP (Square/Rectangle, Penguin/Bird), ISP (Worker → Workable/Eatable), DIP (+ Dependency Injection). Use one SOLID line to justify each pattern choice.

**Case-study method (Lecture 11)** — understand problem → categorize (creation / structure / behaviour) → match intent → check trade-offs. Code smells → patterns: if-else creation → Factory; bloated optional features → Decorator; scattered subsystem calls → Facade; behaviour via flags → State; hard-coded handler sequence → CoR. Lecture cases (likely exam material): food delivery, smart home, LMS, ATM, shopping cart, travel booking, video streaming.

**Microservices (not in slides, but examined every year)** — API Gateway → one service per business capability, DB per service, message broker (Kafka/RabbitMQ), service registry, config server, Docker + Kubernetes, CI/CD per service, monitoring. Consistency: Saga (choreography/orchestration + compensating actions), eventual consistency, outbox, idempotent consumers, CQRS. Security: OAuth2/JWT at the gateway, RBAC, mTLS between services, encryption at rest, secrets vault, rate limiting.

## 4. What the existing print notes already do well

The 11 print notes (`Module Files/Print Notes/`) are strong: one note per pattern (intent, triggers, UML, Java, pros/cons, challenge → mechanism table, model answers to every past-paper and quiz question), plus Note 00 (pattern selector, multi-pattern map, microservices answer bank, HA/DR, configurability).

## 5. Gaps and weak spots I found

1. **No intro/theory page.** Definition, 4 elements, GoF history, full category lists, anti-patterns, "what patterns are not". These are cheap marks in "explain" questions.
2. **Microservices gets one dense page**, although it's a full 25-mark question every year. No worked example for a *new* domain (they change it yearly: supermarket chain → library → media streaming).
3. **Patterns named in lectures but not taught** (Strategy, Observer, Builder, Command, Abstract Factory) appear only in passing. Lecture 1's activity maps scenarios to them ("notify on status change" → Observer, "discount rules" → Strategy, "undo/redo" → Command, "complex report with optional sections" → Builder). A one-line fallback for each could save a Q4 sub-part.
4. **No "Frameworks" content**, despite the module name. At most a 2-mark idea: pattern vs framework vs library, inversion of control, Spring applying DIP/DI, JUnit/Spring applying Template Method.
5. **Density.** About 40 pages of small 2-column text. In an open-book exam, finding things fast matters more than how much is there. Note 00's selector is the right idea but is buried in a table.
6. **HA/DR and "challenges → mechanism"** answers are spread across notes rather than in one place.

## 6. Questions to decide the custom print note

- **Length/format:** a condensed 10–15 page set, or keep everything and add an index plus tabs?
- **Organisation:** by pattern (as now) or by exam question type (Q2 microservices pack, "identify the pattern" lookup, code skeletons)?
- **Code:** full Java for every pattern, or short skeletons you'll adapt?
- **Your weak areas:** which patterns or topics do you feel least sure about?
- **Print constraints:** paper size, single/double sided, colour or B&W, minimum font size?
