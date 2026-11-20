import Banner from "./components/Banner";
import CategorySection from "./components/CategorySection";
import ChooseSection from "./components/ChooseSection";
import Footer from "./components/Footer";

import RequiredSection from "./components/RequiredSection";

export default function Home() {
  return (
    <>
     
      <Banner></Banner>
      <CategorySection></CategorySection>
      <RequiredSection></RequiredSection>
      <ChooseSection></ChooseSection>
      <Footer></Footer>
    </>
  );
}
