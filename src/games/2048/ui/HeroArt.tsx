import heroPng from "../assets/images/hero.png";

export default function HeroArt() {
    return (
        <div className="t2048-hero" aria-hidden="true">
            <img className="t2048-hero__img" src={heroPng} alt="" />
        </div>
    );
}
