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
 * DailyQuestWidgetProvider - Controls the simplified Dailyz Homescreen Widget
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
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);

            String title = prefs.getString(KEY_QUEST_TITLE, context.getString(R.string.widget_default_title));
            int streak = prefs.getInt(KEY_STREAK, 0);
            int stars = prefs.getInt(KEY_STARS, 0);
            boolean isCompleted = prefs.getBoolean(KEY_IS_COMPLETED, false);

            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_daily_quest);

            // Big Quest Text
            if (isCompleted) {
                views.setTextViewText(R.id.widget_quest_title, "✓ Done for today! Great job, Adventurer 🎉");
            } else {
                views.setTextViewText(R.id.widget_quest_title, title);
            }

            // Small Text: Stars & Streak
            String starsLabel = "⭐ " + stars + " " + (stars == 1 ? "Star" : "Stars");
            String streakLabel = "🔥 " + streak + " " + (streak == 1 ? "Day" : "Days");
            views.setTextViewText(R.id.widget_stars_text, starsLabel);
            views.setTextViewText(R.id.widget_streak_text, streakLabel);

            // Tap anywhere on the widget card to launch the app
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

            appWidgetManager.updateAppWidget(appWidgetId, views);
        } catch (Exception ignored) {}
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
