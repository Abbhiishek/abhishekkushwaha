import { IconType } from "react-icons";
import {
  SiDevdotto,
  SiDiscord,
  SiGithub,
  SiHashnode,
  SiInstagram,
  SiNpm,
  SiTwitter
} from "react-icons/si";

export type Link = {
  name: string;
  url: string;
  value: string;
  icon: IconType;
};

export type Links = Link[];

export const links: Links = [
  {
    name: "Discord",
    url: "https://discord.com/users/752362202945683480",
    value: "abbhishek",
    icon: SiDiscord,
  },
  {
    name: "GitHub",
    url: "https://github.com/Abbhiishek",
    value: "@Abbhiishek",
    icon: SiGithub,
  },
  {
    name: "Instagram",
    url: "https://instagram.com/abbhishek.kushwaha",
    value: "@abbhishek.kushwaha",
    icon: SiInstagram,
  },
  {
    name: "Twitter",
    url: "https://twitter.com/abbhishekstwt",
    value: "@abbhishekstwt",
    icon: SiTwitter,
  },
  {
    name: "NPM",
    url: "https://www.npmjs.com/~abbhishek",
    value: "@abbhishek",
    icon: SiNpm,
  },
  {
    name: "Dev.to",
    url: "https://dev.to/abbhiishek",
    value: "@abbhiishek",
    icon: SiDevdotto,
  },
  {
    name: "Hashnode",
    url: "https://h.abhishekkushwaha.me/",
    value: "@abbhishek",
    icon: SiHashnode,
  },
];
