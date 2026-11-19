import Banner from "./components/Banner";
import CategorySection from "./components/CategorySection";
import ChooseSection from "./components/ChooseSection";
import Navbar from "./components/Navbar";
import RequiredSection from "./components/RequiredSection";

export default function Home() {
  return (
    <>
      <Navbar></Navbar>
      <Banner></Banner>
      <CategorySection></CategorySection>
      <RequiredSection></RequiredSection>
      <ChooseSection></ChooseSection>
    </>
  );
}
