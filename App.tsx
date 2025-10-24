
import React, { useState, useCallback, ChangeEvent } from 'react';
import { analyzeImage } from './services/geminiService';
import { fileToGenerativePart } from './utils/fileUtils';
import { UploadIcon, SparklesIcon, AlertTriangleIcon, ImageIcon } from './components/Icons';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione um arquivo de imagem válido.');
        setImageFile(null);
        setPreviewUrl(null);
        return;
      }
      setError('');
      setAnalysis('');
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAnalyzeClick = useCallback(async () => {
    if (!imageFile) {
      setError('Por favor, selecione uma imagem primeiro.');
      return;
    }

    setIsLoading(true);
    setError('');
    setAnalysis('');

    try {
      const imagePart = await fileToGenerativePart(imageFile);
      const prompt = "Identifique tudo que está na imagem, descreva a cena em detalhes e forneça suas percepções sobre o contexto, atmosfera e possíveis narrativas. Seja o mais descritivo e perspicaz possível.";
      
      const result = await analyzeImage(prompt, imagePart);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
      setError(`Falha na análise da imagem: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            Analisador de Imagens com IA
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Envie uma imagem e veja a magia da IA da Gemini em ação.
          </p>
        </header>

        <main className="space-y-6">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-indigo-900/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col items-center justify-center">
                <label
                  htmlFor="file-upload"
                  className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer bg-gray-700/50 hover:bg-gray-700/80 transition-colors duration-300"
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Pré-visualização" className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <div className="text-center">
                      <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-400">
                        <span className="font-semibold text-indigo-400">Clique para enviar</span> ou arraste e solte
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP</p>
                    </div>
                  )}
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                </label>
                
                <button
                  onClick={handleAnalyzeClick}
                  disabled={!imageFile || isLoading}
                  className="mt-6 w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analisando...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="mr-2 h-5 w-5" />
                      Analisar Imagem
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-col">
                <h2 className="text-xl font-semibold text-gray-200 mb-3 flex items-center">
                    <ImageIcon className="mr-2 h-6 w-6 text-indigo-400" />
                    Resultados da Análise
                </h2>
                <div className="bg-gray-900/70 rounded-lg p-4 flex-grow min-h-[16rem] prose prose-invert prose-p:text-gray-300 prose-headings:text-gray-100 overflow-y-auto">
                  {isLoading && (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-400 animate-pulse">Aguardando a percepção da IA...</p>
                    </div>
                  )}
                  {error && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-red-400">
                      <AlertTriangleIcon className="h-10 w-10 mb-2" />
                      <p className="font-semibold">Erro</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  )}
                  {analysis && !isLoading && (
                    <p style={{ whiteSpace: 'pre-wrap' }}>{analysis}</p>
                  )}
                  {!analysis && !isLoading && !error && (
                     <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                      <ImageIcon className="h-10 w-10 mb-2"/>
                      <p>Os resultados da análise aparecerão aqui.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
