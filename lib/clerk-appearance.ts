export const clerkAppearance = {
    variables: {
        colorPrimary: "#06b6d4",
        colorBackground: "#0a0f18",
        colorInputBackground: "#0a111d",
        colorInputText: "#f8fafc",
        colorText: "#f8fafc",
        colorTextSecondary: "#94a3b8",
        colorDanger: "#fb7185",
        borderRadius: "0.9rem",
        fontFamily: "'Inter', sans-serif",
    },
    elements: {
        rootBox: "w-full",
        card: "bg-[#090f18]/95 border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl",
        headerTitle: "text-white font-black tracking-tight",
        headerSubtitle: "text-slate-400",
        socialButtonsBlockButton:
            "bg-white/[0.04] border border-white/10 text-slate-100 hover:bg-white/[0.08] transition-colors",
        socialButtonsBlockButtonText: "text-slate-100",
        formFieldLabel: "text-slate-300 text-[11px] font-semibold uppercase tracking-[0.08em]",
        formFieldInput:
            "h-11 bg-[#070c14] border border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20",
        formButtonPrimary:
            "h-11 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-400 hover:to-blue-400",
        footerActionText: "text-slate-400",
        footerActionLink: "text-cyan-300 hover:text-cyan-200",
        dividerLine: "bg-white/10",
        dividerText: "text-slate-500",
        otpCodeFieldInput:
            "h-11 bg-[#070c14] border border-white/10 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20",
        userButtonAvatarBox: "border border-white/15 hover:border-cyan-400 transition-colors",
        userButtonPopoverCard:
            "bg-[#0a1019] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl",
        userButtonPopoverMain: "bg-transparent",
        userButtonPopoverFooter: "hidden",
        userButtonPopoverActionButton:
            "text-slate-200 hover:bg-white/10 hover:text-white rounded-lg transition-colors",
        userButtonPopoverActionButtonText: "text-slate-200",
        userButtonPopoverActionButtonIcon: "text-slate-400",
        userButtonPopoverActionButton__signOut: "text-rose-300 hover:bg-rose-500/10 hover:text-rose-200",
        modalBackdrop: "bg-black/80 backdrop-blur-sm",
        modalContent: "bg-[#090f18] border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.65)]",
    },
};

export const clerkUserButtonAppearance = {
    elements: {
        avatarBox: "w-9 h-9 border border-white/15 hover:border-cyan-400 transition-colors",
        userButtonPopoverCard:
            "bg-[#0a1019] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl",
        userButtonPopoverMain: "bg-transparent",
        userButtonPopoverFooter: "hidden",
        userButtonPopoverActionButton:
            "text-slate-200 hover:bg-white/10 hover:text-white rounded-lg transition-colors",
        userButtonPopoverActionButtonText: "text-slate-200",
        userButtonPopoverActionButtonIcon: "text-slate-400",
        userButtonPopoverActionButton__signOut: "text-rose-300 hover:bg-rose-500/10 hover:text-rose-200",
    },
};

export const clerkAuthCardAppearance = {
    elements: {
        rootBox: "w-full max-w-[460px]",
    },
};
