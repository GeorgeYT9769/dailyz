package com.georgeyt9769.dailyz;

import android.content.Context;
import android.content.SharedPreferences;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "DailyzWidget")
public class DailyzWidgetPlugin extends Plugin {

    @PluginMethod
    public void updateWidgetData(PluginCall call) {
        try {
            String questTitle = call.getString("questTitle", "");
            String difficulty = call.getString("difficulty", "easy");
            int reward = call.getInt("reward", 1);
            int streak = call.getInt("streak", 0);
            int stars = call.getInt("stars", 0);
            boolean isCompleted = Boolean.TRUE.equals(call.getBoolean("isCompleted", false));

            Context context = getContext();
            SharedPreferences prefs = context.getSharedPreferences(DailyQuestWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = prefs.edit();

            if (questTitle != null && !questTitle.isEmpty()) {
                editor.putString(DailyQuestWidgetProvider.KEY_QUEST_TITLE, questTitle);
            }
            if (difficulty != null) {
                editor.putString(DailyQuestWidgetProvider.KEY_DIFFICULTY, difficulty);
            }
            editor.putInt(DailyQuestWidgetProvider.KEY_REWARD, reward);
            editor.putInt(DailyQuestWidgetProvider.KEY_STREAK, streak);
            editor.putInt(DailyQuestWidgetProvider.KEY_STARS, stars);
            editor.putBoolean(DailyQuestWidgetProvider.KEY_IS_COMPLETED, isCompleted);
            editor.apply();

            // Refresh all active widgets immediately
            DailyQuestWidgetProvider.updateAllWidgets(context);

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to update widget: " + e.getMessage());
        }
    }
}
