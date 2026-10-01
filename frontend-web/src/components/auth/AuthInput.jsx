function AuthInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon: Icon,
  autoComplete,
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm font-medium text-[#1E293B]">{label}</span>
      <div className="group flex items-center gap-2 rounded-xl border border-white/70 bg-white/80 px-3 transition focus-within:border-[#56B97E]/60 focus-within:bg-white">
        {Icon && <Icon size={16} className="text-slate-400 group-focus-within:text-[#56B97E]" />}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="h-11 w-full bg-transparent text-sm text-[#1E293B] outline-none placeholder:text-slate-400"
          required
        />
      </div>
    </label>
  );
}

export default AuthInput;

