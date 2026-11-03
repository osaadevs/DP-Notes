// ===== Product interface =====
interface RoutineTask {
    String generateSchedule();
}

// ===== Concrete products =====
class DailyTask implements RoutineTask {
    @Override
    public String generateSchedule() {
        return "Daily task: runs every day, once per 24 hours.";
    }
}

class WeeklyTask implements RoutineTask {
    @Override
    public String generateSchedule() {
        return "Weekly task: runs once per week on a set day.";
    }
}

class MonthlyTask implements RoutineTask {
    @Override
    public String generateSchedule() {
        return "Monthly task: runs once per month on a set date.";
    }
}

// ===== Abstract creator =====
abstract class TaskCreator {

    // The factory method - subclasses decide which product to create
    protected abstract RoutineTask createTask();

    // Concrete method that USES the product without knowing its concrete type.
    // This is the behaviour that demonstrates the point of Factory Method.
    public void scheduleTask() {
        RoutineTask task = createTask();
        System.out.println(task.generateSchedule());
    }
}

// ===== Concrete creators =====
class DailyTaskCreator extends TaskCreator {
    @Override
    protected RoutineTask createTask() {
        return new DailyTask();
    }
}

class WeeklyTaskCreator extends TaskCreator {
    @Override
    protected RoutineTask createTask() {
        return new WeeklyTask();
    }
}

class MonthlyTaskCreator extends TaskCreator {
    @Override
    protected RoutineTask createTask() {
        return new MonthlyTask();
    }
}

// ===== Demonstration =====
public class FactoryMethodDemo {
    public static void main(String[] args) {
        TaskCreator[] creators = {
            new DailyTaskCreator(),
            new WeeklyTaskCreator(),
            new MonthlyTaskCreator()
        };

        for (TaskCreator creator : creators) {
            creator.scheduleTask();
        }
    }
}