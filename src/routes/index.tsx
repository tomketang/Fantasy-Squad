import { createFileRoute } from "@tanstack/react-router";
import { FantasyApp } from "@/components/fantasy/FantasyApp";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Fantasy Squad 奇幻小队" },
      {
        name: "description",
        content: "收集可爱的奇幻角色，用星积分养成，组队闯关。自动战斗，关键技能由你来放。",
      },
    ],
  }),
});

function Home() {
  return <FantasyApp />;
}
