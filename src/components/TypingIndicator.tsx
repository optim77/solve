export const TypingIndicator = () => {
    return (
        <>
            <span className="dot-anim"></span>
            <style jsx>{`
        .dot-anim::after {
          display: inline-block;
          animation: dots 1.5s steps(4, end) infinite;
          content: "";
        }
        @keyframes dots {
          0% {
            content: "";
          }
          25% {
            content: ".";
          }
          50% {
            content: "..";
          }
          75% {
            content: "...";
          }
          100% {
            content: "";
          }
        }
      `}</style>
        </>
    )
}
