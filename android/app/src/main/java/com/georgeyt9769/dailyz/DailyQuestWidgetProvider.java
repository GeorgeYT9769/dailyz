package com.georgeyt9769.dailyz;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

/**
 * DailyQuestWidgetProvider - Controls the Dailyz Homescreen Widget
 */
public class DailyQuestWidgetProvider extends AppWidgetProvider {

    public static final String PREFS_NAME = "DailyzWidgetPrefs";
    public static final String KEY_QUEST_TITLE = "quest_title";
    public static final String KEY_DIFFICULTY = "quest_difficulty";
    public static final String KEY_REWARD = "quest_reward";
    public static final String KEY_STREAK = "user_streak";
    public static final String KEY_STARS = "user_stars";
    public static final String KEY_IS_COMPLETED = "quest_completed";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);

        String title = prefs.getString(KEY_QUEST_TITLE, context.getString(R.string.widget_default_title));
        String difficulty = prefs.getString(KEY_DIFFICULTY, "easy");
        int reward = prefs.getInt(KEY_REWARD, 1);
        int streak = prefs.getInt(KEY_STREAK, 0);
        int stars = prefs.getInt(KEY_STARS, 0);
        boolean isCompleted = prefs.getBoolean(KEY_IS_COMPLETED, false);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_daily_quest);

        // Update Quest Title
        if (isCompleted) {
            views.setTextViewText(R.id.widget_quest_title, "✓ Done for today! Great job, Adventurer 🎉");
            views.setTextViewText(R.id.widget_action_button, "Rewards →");
        } else {
            views.setTextViewText(R.id.widget_quest_title, title);
            views.setTextViewText(R.id.widget_action_button, context.getString(R.string.widget_action_open));
        }

        // Format Difficulty badge
        String diffText = difficulty.toUpperCase() + " • +" + reward + (reward == 1 ? " STAR" : " STARS");
        views.setTextViewText(R.id.widget_quest_difficulty, diffText);

        // Streak & Stars counters
        views.setTextViewText(R.id.widget_streak_text, streak + "d");
        views.setTextViewText(R.id.widget_stars_text, String.valueOf(stars));

        // Click PendingIntent to launch app
        Intent launchIntent = new Intent(context, MainActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        launchIntent.putExtra("from_widget", true);

        PendingIntent pendingIntent = PendingIntent.getActivity(
                context,
                0,
                launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);
        views.setOnClickPendingIntent(R.id.widget_action_button, pendingIntent);

        // Tell the AppWidgetManager to perform an update on the current app widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    /**
     * Triggers an immediate refresh of all placed Dailyz widgets on the home screen
     */
    public static void updateAllWidgets(Context context) {
        try {
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName thisWidget = new ComponentName(context, DailyQuestWidgetProvider.class);
            int[] allWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget);
            if (allWidgetIds != null && allWidgetIds.length > 0) {
                for (int id : allWidgetIds) {
                    updateAppWidget(context, appWidgetManager, id);
                }
            }
        } catch (Exception ignored) {}
    }
}
