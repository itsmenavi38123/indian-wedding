interface StepProps {
  stepNumber: number;
  title: string;
  description: string;
  // editable: boolean;
  editMode: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export const Step: React.FC<StepProps> = ({
  stepNumber,
  title,
  description,
  // editable,
  editMode,
  onTitleChange,
  onDescriptionChange,
}) => (
  <div className="relative mb-[20px] 2xl:mb-10 md:pl-[80px] 2xl:pl-[105px]">
    <div className="sm:static md:absolute -left-[0px] top-[15px] w-[50px] 2xl:w-[80px] h-[50px] 2xl:h-[80px] rounded-full text-[22px] 2xl:text-[36px] bg-white text-black hidden md:flex items-center justify-center font-bold">
      {stepNumber}
    </div>

    {editMode ? (
      <>
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full text-white text-[30px] 2xl:text-[36px] font-normal leading-normal bg-transparent border-b border-white outline-none mb-2"
        />
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="w-full text-white font-montserrat font-normal text-[15px] 2xl:text-[18px] leading-[24px] 2xl:leading-[30px] bg-transparent border-b border-white outline-none"
          rows={3}
        />
      </>
    ) : (
      <>
        <h3 className="text-white text-[30px] 2xl:text-[36px] font-normal leading-normal">
          {title}
        </h3>
        <p className="text-white font-montserrat font-normal text-[15px] 2xl:text-[18px] leading-[24px] 2xl:leading-[30px]">
          {description}
        </p>
      </>
    )}
  </div>
);
