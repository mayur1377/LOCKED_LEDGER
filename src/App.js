import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Web3Storage } from 'web3.storage';
import { ProgressBar } from  'react-loader-spinner'
import myBackgroundImage from './LEDGER LOCK (1).png';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
// import { useRainbow } from '@rainbow-me/rainbowkit';
import { useAccount, useContract, useSigner } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contract'
const client = new Web3Storage({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGFmRGU4ODM2YzhlNTNDN0UxOUQ2M0IxOTgxRDA0ZDkyYUM5NTMyODEiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2Nzk1NjEzOTQyMzEsIm5hbWUiOiJGaWxlc3RvcmdhZSJ9.qrBf-6vdxiK9_ipwFxog4QSZvdvO9-tjcidHJWKs8rg" });
function App()
{
	const [uploadStatus, setUploadStatus] = useState(5);
	const [files , setFiles]=         useState(null);
	const [file, setFile] = useState(null);
	const [fileName , setFileName ]=useState(null);
	const [fileSize , setFileSize] =useState(null);
	const [fileType , setFileType] =useState(null);
	const { address } = useAccount();
	const { data: signer } = useSigner()
	const [isUploading, setIsUploading] = useState(false);

	// // contract
	const contract = useContract({
	address: CONTRACT_ADDRESS,
	abi: CONTRACT_ABI,
	signerOrProvider: signer	
	})
	const captureFile=async(e)=>
	{
		try{
			setFile(e.target.files);
			setFileName(e.target.files[0].name);
			setFileSize(e.target.files[0].size);
			setFileType(e.target.files[0].type);
		}
		catch(err)
		{
			// alert("error in uploading files");
			setUploadStatus(3);
		}
	};


	
	
	
	const uploadFile = async (e) => {
		e.preventDefault();
		console.log("UPLOADINGGG");
		setUploadStatus(4);
		if (file) {
			try {
				setIsUploading(true);
				const uploadedFile = await client.put(file, {
					name: fileName,
					maxRetries: 1,
					wrapWithDirectory: false,
				});
				console.log(uploadedFile);

				const uploadTxn = await contract.uploadFile(
					uploadedFile?.toString(),
					fileSize?.toString(),
					fileType?.toString(),
					fileName?.toString()
				);
				// await uploadTxn.wait();
				console.log(uploadTxn);
				contract.on("FileUploaded", (fileId, fileHash, fileSize, fileType, fileName, uploadTime, uploader) => {
					// alert(`Hey there! your file has been uploaded and you can take a look at it over here: https://ipfs.io/ipfs/${fileHash}`)
					// uploadstatus=1;
					setUploadStatus(1);
					const file_obj = {
						id: fileId?.toString() ?? fileId,
						hash: fileHash,
						size: fileSize?.toString() ?? fileSize,
						type: fileType,
						name: fileName,
						uploadTime: uploadTime?.toString() ?? uploadTime
					}
					setFiles(prev => [...prev, file_obj])
					// setFiles((prev) => [...prev, file_obj]);
					let filesSet = new Set(setFiles); // Convert the array to a set
					setFiles = [...filesSet];
				})
			} catch (err) {
				// console.log(err);
			setUploadStatus(3);


			}
		} else {
			// alert("NO FILE FOUND!");
			// uploadstatus=2;
			setUploadStatus(2);
		}
		setIsUploading(false);
	};

	function formatFileSize(sizeInBytes) {
		const kiloByte = 1024;
		const megaByte = kiloByte * 1024;
		const gigaByte = megaByte * 1024;
	  
		if (sizeInBytes >= gigaByte) {
		  return `${(sizeInBytes / gigaByte).toFixed(2)} GB`;
		} else if (sizeInBytes >= megaByte) {
		  return `${(sizeInBytes / megaByte).toFixed(2)} MB`;
		} else if (sizeInBytes >= kiloByte) {
		  return `${(sizeInBytes / kiloByte).toFixed(2)} KB`;
		} else {
		  return `${sizeInBytes} Bytes`;
		}
	  }

	  function formatTimestamp(timestamp) {
		const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
		const day = date.getDate().toString().padStart(2, "0");
		const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is zero-based
		const year = date.getFullYear().toString();
	  
		return `${day}/${month}/${year}`;
	  }

	const getFilesUploaded = async () => {
		try {
			const fileCount = await contract.fileCount();
			console.log(fileCount?.toString());
			let filesArr = [];
			for (let i = 0; i < +fileCount?.toString(); i++) {
				const file = await contract.files(address, i);
				const file_obj = {
					id: file[0]?.toString(),
					hash: file[1],
					size: file[2]?.toString(),
					type: file[3],
					name: file[4],
					uploadTime: file[5]?.toString()
				};
				filesArr.push(file_obj);
			}
			const filesSet = new Set(filesArr);
			filesArr=[...filesSet];
			// console.log(filesArr);
			setFiles(filesArr)
		} catch (err) {
			console.log(err);
		}
	};
	useEffect(() => {
		if(contract) {
			getFilesUploaded()
		}
	}, [contract])

	function Component0() {
		return(
			<Alert status='error'>
    <AlertIcon />
    There was an error processing your request
  </Alert>

		);
	  }
	  

	//   sucessfully uploaded
	  function Component1() {
		const [isWaiting, setIsWaiting] = useState(true);
		useEffect(() => {
		  const myPromise = new Promise((resolve, reject) => {
			setTimeout(() => {
				setUploadStatus(5);
			  resolve();
			}, 3000);
		  });
	  
		  myPromise.then(() => {
			setIsWaiting(false);
		  });
		}, []);


		return (
			<Alert status='success'>
    <AlertIcon />
    Data uploaded to the server 🚀
  </Alert>
		);
	  }



	//  upload a file first   
	  function Component2() {
		const [isWaiting, setIsWaiting] = useState(true);
		useEffect(() => {
		  const myPromise = new Promise((resolve, reject) => {
			setTimeout(() => {
				setUploadStatus(5);
			  resolve();
			}, 2000);
		  });
	  
		  myPromise.then(() => {
			setIsWaiting(false);
		  });
		}, []);

	
		return(
			<Alert status='error'>
    <AlertIcon />
    PLEASE UPLOAD A FILE FIRST
  </Alert>
		);

	  }
	  
	  function Component3() {
		const [isWaiting, setIsWaiting] = useState(true);
		useEffect(() => {
		  const myPromise = new Promise((resolve, reject) => {
			setTimeout(() => {
				setUploadStatus(5);
			  resolve();
			}, 2000);
		  });
	  
		  myPromise.then(() => {
			setIsWaiting(false);
		  });
		}, []);
		return (
			<Alert status='error'>
			<AlertIcon />
			ERROR IN UPLOADING FILES , PLEASE TRY LATER WITH A DIFFERENT KIND OF FILE
		  </Alert>
		);
	  }

	  function Component4()
	  {
		return (
			<div >
			<div className="blur-overlay">
			<ProgressBar
  			height="100"
  			width="100"
  			ariaLabel="progress-bar-loading"
  			wrapperStyle={{}}
  			wrapperClass="progress-bar-wrapper"
  			borderColor = '#211e1e'
  			barColor = '#212121'
			/>
			</div>
			</div>
		);
	  }

	
	return (
		
		<div  style={{ backgroundColor: 'transparent' }}>


		{typeof address!=='undefined' ? (
			
			<div style={{ backgroundColor: 'transparent' , position:'absolute' }}>
				<div style={{ display: 'flex', alignItems: 'right', justifyContent: 'right', top: '1vh', position: 'fixed' , }}>
					<ConnectButton/>
				</div>

				<form onSubmit={(e)=>uploadFile(e)} >
					<br></br>
					<br></br>
					<br></br>
					<br></br>
					<br></br>
					<br></br>
					<br></br>
					<br></br>
					<label for="inputTag">
					<input id="temp" class='relative inline-flex text-sm sm:text-base rounded-full font-medium border-2 border-transparent transition-colors outline-transparent focus:outline-transparent disabled:opacity-50 disabled:pointer-events-none disabled:opacity-40 disabled:hover:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
					text-white px-10 py-2 sm:py-1.5 sm:px-10'
					type="file" style={{display:'flex' , left:'33vw' , top:'8vh'}}  onChange={(e)=>captureFile(e)}/>
					</label>
					<br></br>
					{/* <label htmlFor="filecap" style={{display:'flex' , justifyContent:'center'}}> {fileName ? fileName : "PLEASE CHOOSE A FILE"} </label> */}
					<br></br>
					<div class="screen flex items-center justify-center   pt-10 pb-0 ">
					<button 
					class='relative inline-flex text-sm sm:text-base rounded-full font-medium border-2 border-transparent transition-colors outline-transparent focus:outline-transparent disabled:opacity-50 disabled:pointer-events-none disabled:opacity-40 disabled:hover:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
					text-white bg-[#4040F2] hover:bg-[#3333D1] focus:border-[#B3B3FD] focus:bg-[#4040F2] px-10 py-2 sm:py-1.5 sm:px-10'
					 type="submit" >{
						isUploading? "UPLOADING..." : "UPLOAD"
					} </button>
					</div>

					<div>
					{uploadStatus === 0 && <Component0 />}
      				{uploadStatus === 1 && <Component1 />}
      				{uploadStatus === 2 && <Component2 />}
      				{uploadStatus === 3 && <Component3 />}
      				{uploadStatus === 4 && <Component4 />}

					</div>
<br></br>
{/* <button onClick={getFilesUploaded}>Get Files</button> */}
<div className="flex flex-col mx-6 my-8">
  <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg dark:border-black">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-1000" style={{ width:'96vw'}}>
          <thead style={{backgroundColor:'#ff69ea'}}>
            <tr className="border-b dark:border-gray-600">
													<th
														scope="col"
														className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
													>
														id
													</th>
													<th
														scope="col"
														className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
													>
														name
													</th>
													<th
														scope="col"
														className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
													>
														type
													</th>
													<th
														scope="col"
														className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
													>
														size
													</th>
													<th
														scope="col"
														className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
													>
														date
													</th>
													<th
														scope="col"
														className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
													>
														hash/view/get
													</th>
													{/* <th>
														{/* DELETE */}
													{/* </th> */} */}
												</tr>
											</thead>
											{files?.length > 0 && files.slice().reverse().map((file, key) => (
												<tbody
												style={{
													background: 'rgba(255, 255, 255, 0.2)',
													borderRadius: '16px',
													boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
													backdropFilter: 'blur(50px)',
													webkitBackdropFilter: 'blur(13.4px)',
													border: '1px solid rgba(255, 255, 255, 0.3)'
												  }}
													className="bg-transparent dark:bg-blue-opaque divide-y divide-gray-200"
													key={key}
												>
													<tr>
														<td className="px-4 py-4 whitespace-nowrap">
															<div className="flex items-center">
																<div className="text-sm font-medium text-gray-900 ">
																	{files.length-file.id+1}
																</div>
															</div>
														</td>
														<td className="px-4 py-4 whitespace-nowrap">
															<div className="text-sm text-gray-900 ">
																{file.name}
															</div>
														</td>
														<td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
															{file.type}
														</td>
														<td className="px-4 py-4 whitespace-nowrap">
															<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-pink-100 dark:text-pink-800">
																{formatFileSize(file.size)}
															</span>
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
															{formatTimestamp(file.uploadTime)}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
															<a
																href={
																	"https://ipfs.io/ipfs/" + file.hash
																}
																className="text-indigo-900 hover:text-indigo-1200 dark:text-purple-900 dark:hover:text-purple-1200"
																rel="noopener noreferrer"
																target="_blank"
															>
																{file.hash.substring(0, 15)}...
															</a>
														</td>
														<td>
															<button>delete</button>
														</td>
													</tr>
												</tbody>
											))}
										</table>
									</div>
								</div>
							</div>
						</div>
				</form>
			</div> ):
			(
				<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '40vh', position: 'fixed'   , left:'45%'  , transform : 'translate(-50%, -50%)' ,transform:'scale(2)'}}>
				<ConnectButton/>
				</div>
				// <div></div>
				// <div class="screen flex items-center justify-center">
				// 	<br></br>
				// 	PLEASE CONNECT WALLET
				// </div>
			) }
		</div>
		
	);
}
export default App;