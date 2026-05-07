import Navbar from './components/Navbar';
import Particles from './components/Particles';

export default function App(props) {
  return (
    <>
      <Particles />
      <div class="spotlight" id="spotlight"></div>
      <Navbar />
      <main>
        {props.children}
      </main>
    </>
  );
}
