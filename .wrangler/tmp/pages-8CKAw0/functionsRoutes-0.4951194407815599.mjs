import { onRequestGet as __api_admin_games_ts_onRequestGet } from "C:\\Users\\Jimmy\\projects\\taren\\functions\\api\\admin\\games.ts"
import { onRequestGet as __api_admin_live_ts_onRequestGet } from "C:\\Users\\Jimmy\\projects\\taren\\functions\\api\\admin\\live.ts"
import { onRequestGet as __api_admin_overview_ts_onRequestGet } from "C:\\Users\\Jimmy\\projects\\taren\\functions\\api\\admin\\overview.ts"
import { onRequestGet as __api_admin_pages_ts_onRequestGet } from "C:\\Users\\Jimmy\\projects\\taren\\functions\\api\\admin\\pages.ts"
import { onRequestGet as __api_admin_recent_ts_onRequestGet } from "C:\\Users\\Jimmy\\projects\\taren\\functions\\api\\admin\\recent.ts"
import { onRequestGet as __api_admin_timeseries_ts_onRequestGet } from "C:\\Users\\Jimmy\\projects\\taren\\functions\\api\\admin\\timeseries.ts"
import { onRequest as __parakollen_api_medals_ts_onRequest } from "C:\\Users\\Jimmy\\projects\\taren\\functions\\parakollen\\api\\medals.ts"
import { onRequest as __parakollen_api_news_ts_onRequest } from "C:\\Users\\Jimmy\\projects\\taren\\functions\\parakollen\\api\\news.ts"
import { onRequest as __parakollen_api_results_ts_onRequest } from "C:\\Users\\Jimmy\\projects\\taren\\functions\\parakollen\\api\\results.ts"
import { onRequest as __parakollen_api_schedule_ts_onRequest } from "C:\\Users\\Jimmy\\projects\\taren\\functions\\parakollen\\api\\schedule.ts"
import { onRequest as __parakollen_api_today_ts_onRequest } from "C:\\Users\\Jimmy\\projects\\taren\\functions\\parakollen\\api\\today.ts"
import { onRequestGet as __api_event_ts_onRequestGet } from "C:\\Users\\Jimmy\\projects\\taren\\functions\\api\\event.ts"
import { onRequestPost as __api_event_ts_onRequestPost } from "C:\\Users\\Jimmy\\projects\\taren\\functions\\api\\event.ts"
import { onRequest as ____path___ts_onRequest } from "C:\\Users\\Jimmy\\projects\\taren\\functions\\[[path]].ts"

export const routes = [
    {
      routePath: "/api/admin/games",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_games_ts_onRequestGet],
    },
  {
      routePath: "/api/admin/live",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_live_ts_onRequestGet],
    },
  {
      routePath: "/api/admin/overview",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_overview_ts_onRequestGet],
    },
  {
      routePath: "/api/admin/pages",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_pages_ts_onRequestGet],
    },
  {
      routePath: "/api/admin/recent",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_recent_ts_onRequestGet],
    },
  {
      routePath: "/api/admin/timeseries",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_timeseries_ts_onRequestGet],
    },
  {
      routePath: "/parakollen/api/medals",
      mountPath: "/parakollen/api",
      method: "",
      middlewares: [],
      modules: [__parakollen_api_medals_ts_onRequest],
    },
  {
      routePath: "/parakollen/api/news",
      mountPath: "/parakollen/api",
      method: "",
      middlewares: [],
      modules: [__parakollen_api_news_ts_onRequest],
    },
  {
      routePath: "/parakollen/api/results",
      mountPath: "/parakollen/api",
      method: "",
      middlewares: [],
      modules: [__parakollen_api_results_ts_onRequest],
    },
  {
      routePath: "/parakollen/api/schedule",
      mountPath: "/parakollen/api",
      method: "",
      middlewares: [],
      modules: [__parakollen_api_schedule_ts_onRequest],
    },
  {
      routePath: "/parakollen/api/today",
      mountPath: "/parakollen/api",
      method: "",
      middlewares: [],
      modules: [__parakollen_api_today_ts_onRequest],
    },
  {
      routePath: "/api/event",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_event_ts_onRequestGet],
    },
  {
      routePath: "/api/event",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_event_ts_onRequestPost],
    },
  {
      routePath: "/:path*",
      mountPath: "/",
      method: "",
      middlewares: [],
      modules: [____path___ts_onRequest],
    },
  ]