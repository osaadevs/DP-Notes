import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class RoutineConfigManager {
    
    // Instance fields: the routine engine's configuration
    private final List<String> sections;
    private final int toleranceDays;
    private final Map<String, String> scheduleRules;

    // Private constructor prevents external instantiation
    private RoutineConfigManager() {
        this.sections = Arrays.asList("housekeeping", "pool", "adventure", "dining");
        this.toleranceDays = 2;
        this.scheduleRules = new HashMap<>();
    }

    // Static holder idiom: the instance is created only when
    // getInstance() is first called, and the JVM guarantees the
    // class-loading is thread-safe without needing synchronized.
    private static class ConfigHolder {
        private static final RoutineConfigManager INSTANCE = new RoutineConfigManager();
    }

    public static RoutineConfigManager getInstance() {
        return ConfigHolder.INSTANCE;
    }

    // Getters
    public List<String> getSections() {
        return sections;
    }

    public int getToleranceDays() {
        return toleranceDays;
    }

    public Map<String, String> getScheduleRules() {
        return scheduleRules;
    }

    // Demonstration
    public static void main(String[] args) {
        RoutineConfigManager config1 = RoutineConfigManager.getInstance();
        RoutineConfigManager config2 = RoutineConfigManager.getInstance();

        System.out.println("Sections: " + config1.getSections());
        System.out.println("Tolerance window (days): " + config1.getToleranceDays());
        System.out.println("Same instance? " + (config1 == config2));
    }
}