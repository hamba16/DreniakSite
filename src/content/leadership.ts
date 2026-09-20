export interface Leader {
  id: string;
  name: string;
  title: string;
  initials: string;
  scope: "Dreniak Limited" | "Dreniak Engineering";
  email?: string;
  phone?: { label: string; href: string };
  portrait?: { src: string; position?: string };
}

// Supplied and confirmed contacts only.
export const leaders: readonly Leader[] = [
  {
    id: "darren-kamunuga",
    name: "Darren Kamunuga",
    title: "Central Director",
    initials: "DK",
    scope: "Dreniak Limited",
    email: "d.kamunuga@dreniak.com",
    phone: { label: "+44 7789 063938", href: "tel:+447789063938" },
    // Warm ivory matches the existing portrait frame and approved founder photo.
    // Background-only edits pair the leadership photos without tinting skin/clothes;
    // the separate approved Darren founder.jpg is intentionally unchanged.
    portrait: { src: "/images/Team/darren-ivory.webp", position: "50% 30%" },
  },
  {
    id: "derrick-nkurunungi",
    name: "Derrick Nkurunungi",
    title: "Director, Engineering",
    initials: "DN",
    scope: "Dreniak Engineering",
    email: "derricknkurunungi7@gmail.com",
    phone: { label: "+256 704 175 005", href: "tel:+256704175005" },
    portrait: { src: "/images/Team/derrick-ivory.webp", position: "50% 50%" },
  },
  {
    id: "tania-judith-bita-olielo",
    name: "Tania Judith Bita Olielo",
    title: "Legal Consultant",
    initials: "TO",
    scope: "Dreniak Limited",
  },
  {
    id: "jude-karamura",
    name: "Jude Karamura",
    title: "Engineering Pro-Consultant",
    initials: "JK",
    scope: "Dreniak Engineering",
  },
];
