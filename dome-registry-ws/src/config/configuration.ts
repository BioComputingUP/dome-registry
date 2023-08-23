import {readFileSync} from 'fs';
import {load as loadYamlFile} from 'js-yaml';
import {join} from 'path';

// Export configuration parameters loaded from YAML file
// https://docs.nestjs.com/techniques/configuration#custom-configuration-files
export const configuration = () => {
    // Define environment name
    let env = process.env.NODE_ENV ?? 'development';
    // Compute configuration file path
    let path = join(__dirname, `environments`, `${env}.yaml`);
    // Load YAML configuration file
    return loadYamlFile(readFileSync(path, 'utf8')) as Record<string, any>;
};
