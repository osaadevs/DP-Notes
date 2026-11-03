// ===== Subsystem classes =====

class PhotoProofValidator {
    public boolean validate(String photo) {
        System.out.println("Validating photo proof: " + photo);
        // A real check would inspect the file; here we treat a non-empty photo as valid.
        return photo != null && !photo.isEmpty();
    }
}

class TaskCompletionRecorder {
    public void record(String taskId) {
        System.out.println("Recording task " + taskId + " as complete with timestamp.");
    }
}

class ToleranceChecker {
    public boolean isWithinTolerance(String taskId) {
        System.out.println("Checking task " + taskId + " against the tolerance window.");
        // A real check would compare completion time to the config's tolerance window.
        return true;
    }
}

class DashboardUpdater {
    public void update(String taskId) {
        System.out.println("Updating GM dashboard for task " + taskId + ".");
    }
}

class AlertDispatcher {
    public void sendMissAlert(String taskId) {
        System.out.println("Sending miss alert to GM for task " + taskId + ".");
    }
}

// ===== Facade =====

class TaskSignOffFacade {

    private final PhotoProofValidator photoProofValidator;
    private final TaskCompletionRecorder taskCompletionRecorder;
    private final ToleranceChecker toleranceChecker;
    private final DashboardUpdater dashboardUpdater;
    private final AlertDispatcher alertDispatcher;

    public TaskSignOffFacade() {
        this.photoProofValidator = new PhotoProofValidator();
        this.taskCompletionRecorder = new TaskCompletionRecorder();
        this.toleranceChecker = new ToleranceChecker();
        this.dashboardUpdater = new DashboardUpdater();
        this.alertDispatcher = new AlertDispatcher();
    }

    // One simple entry point that hides the whole multi-step workflow.
    public void completeSignOff(String taskId, String photo) {

        // Step 1: photo must be valid, otherwise stop the whole process.
        if (!photoProofValidator.validate(photo)) {
            System.out.println("Sign-off rejected: invalid photo proof.");
            return;
        }

        // Step 2: record the task as complete.
        taskCompletionRecorder.record(taskId);

        // Step 3: check whether it was done inside the tolerance window.
        boolean withinTolerance = toleranceChecker.isWithinTolerance(taskId);

        // Step 4: update the GM dashboard.
        dashboardUpdater.update(taskId);

        // Step 5: only alert if the task fell outside tolerance.
        if (!withinTolerance) {
            alertDispatcher.sendMissAlert(taskId);
        }

        System.out.println("Sign-off complete for task " + taskId + ".");
    }
}

// ===== Demonstration =====

public class FacadeDemo {
    public static void main(String[] args) {
        TaskSignOffFacade facade = new TaskSignOffFacade();
        facade.completeSignOff("HK-101", "housekeeping_photo.jpg");
    }
}