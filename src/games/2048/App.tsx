import "./styles/base.css";
import "./styles/tiles.css";
import "./styles/animations.css";

import HeroArt from "./ui/HeroArt";
import Board from "./ui/Board";

export default function App() {
    return (
        <div className="t2048-root">
            <HeroArt />
            <Board />
        </div>
    );
}
