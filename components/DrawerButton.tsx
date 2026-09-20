import { DrawerProvider, OpenDrawerButton } from "@/components/DrawerProvider";

type Props = {
  title: string; // the drawer's heading
  button: React.ReactNode; // what the button shows
  buttonClassName: string;
  children: React.ReactNode; // what the drawer holds
};

// A button that opens its own drawer. (For several buttons sharing one drawer, use DrawerProvider.)
export default function DrawerButton({ title, button, buttonClassName, children }: Props) {
  return (
    <DrawerProvider title={title} content={children}>
      <OpenDrawerButton className={buttonClassName}>{button}</OpenDrawerButton>
    </DrawerProvider>
  );
}
