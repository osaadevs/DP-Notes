# Design Patterns — In-Class Quiz Questions

Transcribed from `In Class Quizes.pdf` (12 scanned pages, two students' handwritten copies of the same quizzes). Where the two copies differ, the clearer wording is used and the difference is noted. Answers are omitted.

| # | Topic | Source pages |
|---|-------|--------------|
| 1 | Smart Parking Management System | 1, 7 |
| 2 | Database Object Creation | 2, 11 |
| 3 | Library Barcode Scanner (Quiz 03, 27/07/2026) | 5, 9 |
| 4 | Smart Printing System | 4, 12 |
| 5 | Social Media User Profile (Quiz 05) | 3, 10 |
| 6 | Online Course Completion System | 6 |
| 7 | Technical Support System | 8 |

Quiz numbering in the PDF is incomplete (only Quiz 02, 03 and 05 are labelled), so the order above is arbitrary.

---

## Quiz 1 — Smart Parking Management System

A university is developing a smart parking management system to manage vehicles entering and leaving the campus. A parking session can move through the following states:

1. Available state
2. Reserved state
3. Occupied state *(second copy: "Pre-Occupied state")*
4. Payment Due state
5. Closed state

The behaviour of the parking session depends on its current state.

1. Explain why the State pattern is appropriate for this system. **(4 marks)**
2. Draw a state diagram for the smart parking management system. **(4 marks)**
3. Design a UML class diagram for the above. **(6 marks)**
4. Based on your UML diagram, write Java implementation for the parking session context class. **(3 marks)**
5. The university later decides to integrate an existing legacy parking payment machine. The university can't modify the legacy class because it is supplied by an external vendor. Provide a solution using design pattern knowledge.

---

## Quiz 2 — Database Object Creation *(labelled "Quiz 02", 13/07/2026)*

An application supports 3 databases:

1. MySQL
2. PostgreSQL
3. MongoDB

Developers currently create database objects as follows:

```java
MySQLDatabase db = new MySQLDatabase();
db.create(product);
```

The software architect suggests using the Factory design pattern.

1. What is the role of the database pattern? *(second copy: "What is the role of the database")*
2. State two advantages of using the Factory design pattern in this scenario.
3. Why does the developer not need to know whether the DB is MySQL or PostgreSQL?
4. How to ensure only one DB connection is active at a given time?

---

## Quiz 3 — Library Barcode Scanner *(labelled "Quiz 03", 27/07/2026)*

A university library uses a library management system to manage book borrowing and returning. The existing system communicates with an old barcode scanner using the following method:

```java
scanBook()
```

The library purchases a new barcode scanner from a different vendor. However, the new scanner provides the following method:

```java
readBarcode()
```

The library management system contains hundreds of calls to `scanBook()`. The university doesn't want to modify the existing application.

1. What would be the reason not to modify the existing code?
2. What would be the appropriate design pattern? Explain the reasons.
3. Identify the Client, Target, Adapter and Adaptee participants in the solution.
4. Draw a UML class diagram showing the relationships among these participants.
5. What would be the approach to provide one simple interface for borrowing books by internally calling inventory, payment, notification and login services?

---

## Quiz 4 — Smart Printing System

A university has introduced a smart printing system. Students from the computer lab, library, engineering lab and staff room can send print jobs to a single high-speed printer. A software developer creates a new `PrinterManager` object every time a department submits a print request. After a few weeks *(first copy: "minutes")* the university notices the following problems:

1. Print jobs are processed in the wrong order.
2. Some print jobs are duplicated.
3. The printer occasionally becomes unresponsive.
4. Different departments display different printer statuses.

1. Explain two problems that could occur because multiple printer manager objects are created. **(2 marks)**
2. Recommend an appropriate design approach to solve this problem and explain why it is suitable. **(3 marks)**
3. *(A third question starts at the bottom of page 4 but is cut off in the scan — only "...to be created" is readable. The second copy has only Q1 and Q2.)*

---

## Quiz 5 — Social Media User Profile *(labelled "Quiz 05")*

A social media application has a `UserProfile` class that stores basic information such as name, email and profile picture. Over time the app wants to add extra features to the profile such as a premium badge *(written "batch")*, two-factor authentication (2FA), and profile theme *(second copy: "profile name")*. Instead of modifying the `UserProfile` class directly or creating multiple subclasses:

1. What is the design pattern that can be used?
2. Explain how the selected design pattern can be applied. **(3 marks)**
3. Draw a class structure for the selected design pattern. **(8 marks)**
4. Write Java-like code that shows how a user profile can be wrapped with multiple decorators. **(3 marks)**
5. Discuss possible challenges when applying the selected design pattern in real-world applications such as the above. Consider aspects such as code complexity, debugging, performance and readability. **(4 marks)**

---

## Quiz 6 — Online Course Completion System

An online learning platform offers different types of courses:

1. Programming course
2. Design course

When a student completes a course, the system follows the same overall process:

1. Validate the student's course registration.
2. Deliver the course-specific final assessment.
3. Evaluate the student's performance.
4. Generate a completion certificate.
5. *(left blank in the source)*

However, the final assessment and evaluation processes are different for each course.

**Programming course**
- Students complete a coding challenge.
- The solution is evaluated using automated tests.

**Design course**
- Students submit a design portfolio.
- The portfolio is evaluated by an instructor using an assessment rubric.

The company wants to ensure that all courses follow the same completion process, while allowing each course type to customize the assessment and evaluation steps.

1. Identify the most appropriate design pattern and explain why this design pattern is suitable for the given scenario. **(2 marks)**
2. Draw a UML class diagram for the solution. **(8 marks)**
3. Write Java-like code for the abstract class. **(3 marks)**
4. Write Java-like code for the programming course and design course. **(4 marks)**
5. The platform also allows students to access additional optional course features. The base features are course content, assignments and final assessment. Students may optionally add:
   1. AI learning assistant
   2. Premium learning materials and one-to-one mentor support

   Explain how to implement the given scenario. (UML diagrams and code are not necessary.) **(3 marks)**

---

## Quiz 7 — Technical Support System

A software company is developing a technical support system to troubleshoot customer issues. When a customer submits a support request, it may need to pass through several levels of support. The levels are:

1. **L1 Support** — handles basic issues such as password resets and blocked accounts.
2. **L2 Support** — handles technical issues such as software installation errors.
3. **L3 Support** — handles database connectivity issues and performance bottlenecks.
4. **Specialist Support** — handles rare problems that can't be resolved by L1, L2 or L3.

1. Explain how the Chain of Responsibility (CoR) design pattern can be applied to the system. You should identify the request, handler and concrete handlers. **(4 marks)**
2. Draw a UML class diagram to represent the above system using the Chain of Responsibility pattern. **(6 marks)**
3. Write a Java-like implementation to demonstrate how a request for a database connectivity issue is processed through the support chain. **(6 marks)**
4. Assume that every support level must follow the same overall procedure:
   1. Log the support request.
   2. Attempt to solve the issue.
   3. Log the resolution.

   However, each support level should be able to implement its own specific problem-solving logic. Explain how you could design the system to enforce the above procedure. **(4 marks)**
